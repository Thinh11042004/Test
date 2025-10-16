import 'dart:async';
import 'package:flutter/material.dart';

import '../models/task.dart';
import '../widgets/task_item.dart';
import 'add_task_sheet.dart';
import 'category_manager_screen.dart';
import 'task_detail_screen.dart';

// DB & Repo
import '../services/db_service.dart';
import '../models/domain/entities/task_entity.dart';
import '../models/data/repositories/task_repository.dart';
import '../services/notification_service.dart';

// tách tab
import 'tabs/menu_tab.dart';
import 'tabs/calendar_tab.dart';
import 'tabs/me_tab.dart';

// search
import 'search/task_search_delegate.dart';

// 👇 thêm: Pro demo
import '../services/pro_manager.dart';
import 'Pay/upgrade_pro_demo_screen.dart';

enum SortOption {
  dueDate,
  createdNewestBottom,
  createdNewestTop,
  az,
  za,
  manual,
}

enum _MenuAction {
  manageCategories,
  search,
  sort,
  printTasks,
  toggleCompact,
  upgradePro,
}

class TaskListScreen extends StatefulWidget {
  final List<Task> tasks; // giữ tham số cũ để không phá route khác
  final void Function(Task) onAdd;
  final void Function(Task) onUpdate;

  const TaskListScreen({
    super.key,
    required this.tasks,
    required this.onAdd,
    required this.onUpdate,
  });

  @override
  State<TaskListScreen> createState() => _TaskListScreenState();
}

class _TaskListScreenState extends State<TaskListScreen> {
  // ----- DB + memory -----
  final TaskRepository _repo = DbService.tasks;
  final List<Task> _items = [];
  StreamSubscription<List<TaskEntity>>? _subscription;

  // Map DB -> UI Task
  Task _fromEntity(TaskEntity e) {
    final due = e.dueAt?.toLocal();

    Duration? remindBefore;
    if (e.remindAt != null && due != null) {
      final diff =
          due.millisecondsSinceEpoch - e.remindAt!.millisecondsSinceEpoch;
      if (diff > 0) remindBefore = Duration(milliseconds: diff);
    }

    TimeOfDay? timeOfDay;
    if (due != null && (due.hour != 0 || due.minute != 0)) {
      timeOfDay = TimeOfDay(hour: due.hour, minute: due.minute);
    }

    return Task(
      id: (e.id ?? 0).toString(),
      title: e.title,
      category: _categoryFromId(e.categoryId),
      dueDate: due,
      timeOfDay: timeOfDay,
      reminderBefore: remindBefore,
      repeat: RepeatRule.none,
      subtasks: const [],
      done: e.status == 'done',
      favorite: false,
      createdAt: e.createdAt.toLocal(),
      updatedAt: e.updatedAt.toLocal(),
    );
  }

  TaskCategory _categoryFromId(String? id) {
    switch (id) {
      case 'work':
        return TaskCategory.work;
      case 'personal':
        return TaskCategory.personal;
      case 'favorite':
        return TaskCategory.favorites;
      case 'birthday':
        return TaskCategory.birthday;
      default:
        return TaskCategory.none;
    }
  }

  String? _categoryToId(TaskCategory category) {
    switch (category) {
      case TaskCategory.work:
        return 'work';
      case TaskCategory.personal:
        return 'personal';
      case TaskCategory.favorites:
        return 'favorite';
      case TaskCategory.birthday:
        return 'birthday';
      case TaskCategory.none:
        return null;
    }
  }

  // Map UI -> DB entity
  TaskEntity _toEntity(Task t) {
    DateTime? due;
    if (t.dueDate != null && t.timeOfDay != null) {
      due = DateTime(
        t.dueDate!.year,
        t.dueDate!.month,
        t.dueDate!.day,
        t.timeOfDay!.hour,
        t.timeOfDay!.minute,
      );
    } else {
      due = t.dueDate;
    }

    final int? remindAtMs = (due != null && t.reminderBefore != null)
        ? due.millisecondsSinceEpoch - t.reminderBefore!.inMilliseconds
        : null;

    return TaskEntity(
      id: int.tryParse(t.id),
      title: t.title,
      notes: null,
      dueAt: due,
      remindAt:
          remindAtMs != null ? DateTime.fromMillisecondsSinceEpoch(remindAtMs) : null,
      status: t.done ? 'done' : 'todo',
      priority: 'normal',
      categoryId: _categoryToId(t.category),
      tags: const [],
      createdAt: t.createdAt.toUtc(),
      updatedAt: t.updatedAt.toUtc(),
    );
  }

  // -------------------- CRUD helpers (đÃ GỘP, KHÔNG TRÙNG) --------------------

  Future<int> _addTask(Task newTask) async {
    final now = DateTime.now();
    newTask
      ..createdAt = now
      ..updatedAt = now;

    final entity = _toEntity(newTask);
    final id = await _repo.add(entity);

    // gán id lại cho Task UI
    newTask.id = id.toString();

    // chỉ đặt reminder nếu chưa hoàn thành
    if (!newTask.done) {
      await NotificationService.instance
          .scheduleForTask(entity.copyWith(id: id));
    }
    return id;
  }

  Future<void> _updateTask(Task t) async {
    // cập nhật thời gian sửa
    t.updatedAt = DateTime.now();

    final id = int.tryParse(t.id);
    if (id == null) return;

    final entity = _toEntity(t).copyWith(id: id);

    // lưu DB (updatedAt đã được set mới)
    await _repo.update(entity);

    // quản lý nhắc nhở theo trạng thái
    if (t.done) {
      await NotificationService.instance.cancelReminder(id);
    } else {
      await NotificationService.instance.scheduleForTask(entity);
    }
  }

  Future<void> _deleteTaskById(String? id) async {
    final intId = int.tryParse(id ?? '');
    if (intId != null) {
      await _repo.delete(intId);
      await NotificationService.instance.cancelReminder(intId);
    }
  }

  // -------------------- UI state --------------------
  int _tabIndex = 1; // 0=Menu, 1=Nhiệm vụ, 2=Lịch, 3=Của tôi
  TaskCategory? filter; // null = tất cả
  SortOption _sort = SortOption.dueDate;
  bool _compact = false;

  List<Task> get _filtered {
    List<Task> list = List.of(_items);
    if (filter != null) {
      list = list
          .where(
            (t) =>
                (filter == TaskCategory.work &&
                    t.category == TaskCategory.work) ||
                (filter == TaskCategory.personal &&
                    t.category == TaskCategory.personal),
          )
          .toList();
    }
    switch (_sort) {
      case SortOption.dueDate:
        list.sort((a, b) {
          final ad = a.dueDate, bd = b.dueDate;
          if (ad == null && bd == null) return 0;
          if (ad == null) return 1;
          if (bd == null) return -1;
          final at = a.timeOfDay, bt = b.timeOfDay;
          final adt = DateTime(
            ad.year,
            ad.month,
            ad.day,
            at?.hour ?? 23,
            at?.minute ?? 59,
          );
          final bdt = DateTime(
            bd.year,
            bd.month,
            bd.day,
            bt?.hour ?? 23,
            bt?.minute ?? 59,
          );
          return adt.compareTo(bdt);
        });
        break;
      case SortOption.createdNewestBottom:
        list.sort((a, b) => a.createdAt.compareTo(b.createdAt));
        break;
      case SortOption.createdNewestTop:
        list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        break;
      case SortOption.az:
        list.sort(
          (a, b) => a.title.toLowerCase().compareTo(b.title.toLowerCase()),
        );
        break;
      case SortOption.za:
        list.sort(
          (a, b) => b.title.toLowerCase().compareTo(a.title.toLowerCase()),
        );
        break;
      case SortOption.manual:
        // thứ tự giữ nguyên theo _items
        break;
    }
    return list;
  }

  @override
  void initState() {
    super.initState();
    // Lắng nghe DB → cập nhật UI + đồng bộ notifications
    _subscription = _repo.watchAll().listen((rows) {
      setState(() {
        _items
          ..clear()
          ..addAll(rows.map(_fromEntity));
      });

      for (final entity in rows) {
        if (entity.id == null) continue;
        if (entity.status == 'done') {
          unawaited(NotificationService.instance.cancelReminder(entity.id));
        } else {
          unawaited(NotificationService.instance.scheduleForTask(entity));
        }
      }
    });
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final titles = ['Menu', 'Nhiệm vụ', 'Lịch', 'Của tôi'];
    final view = _buildTabView(context);
    return Scaffold(
      appBar: AppBar(
        title: AnimatedSwitcher(
          duration: const Duration(milliseconds: 250),
          transitionBuilder: (child, animation) => FadeTransition(
            opacity: animation,
            child: SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(0, .2),
                end: Offset.zero,
              ).animate(animation),
              child: child,
            ),
          ),
          child: Text(
            titles[_tabIndex],
            key: ValueKey(_tabIndex),
          ),
        ),
        actions: _tabIndex == 1 ? [_buildMoreMenu()] : null,
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 400),
        switchInCurve: Curves.easeOutCubic,
        switchOutCurve: Curves.easeInCubic,
        transitionBuilder: (child, animation) {
          final offsetAnimation = Tween<Offset>(
            begin: const Offset(.02, .04),
            end: Offset.zero,
          ).animate(animation);
          return FadeTransition(
            opacity: animation,
            child: SlideTransition(position: offsetAnimation, child: child),
          );
        },
        child: KeyedSubtree(
          key: ValueKey('tab-$_tabIndex'),
          child: view,
        ),
      ),
      floatingActionButton: AnimatedSwitcher(
        duration: const Duration(milliseconds: 280),
        transitionBuilder: (child, animation) => ScaleTransition(
          scale: CurvedAnimation(parent: animation, curve: Curves.easeOutBack),
          child: child,
        ),
        child: _tabIndex == 1
            ? FloatingActionButton(
                key: const ValueKey('fab'),
                onPressed: () async {
                  final newTask = await showModalBottomSheet<Task>(
                    context: context,
                    isScrollControlled: true,
                    useSafeArea: true,
                    showDragHandle: true,
                    builder: (_) => const AddTaskSheet(),
                  );
                  if (newTask != null) {
                    await _addTask(newTask);
                    setState(() {});
                  }
                },
                child: const Icon(Icons.add),
              )
            : const SizedBox.shrink(),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tabIndex,
        onDestinationSelected: (i) => setState(() => _tabIndex = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.menu), label: 'Menu'),
          NavigationDestination(icon: Icon(Icons.checklist), label: 'Nhiệm vụ'),
          NavigationDestination(
            icon: Icon(Icons.calendar_month),
            label: 'Lịch',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_rounded),
            label: 'Của tôi',
          ),
        ],
      ),
    );
  }

  PopupMenuButton<_MenuAction> _buildMoreMenu() {
    return PopupMenuButton<_MenuAction>(
      icon: const Icon(Icons.more_vert),
      onSelected: _onMenuAction,
      itemBuilder: (ctx) {
        final isPro = ProManager.instance.isPro.value;
        return [
          const PopupMenuItem(
            value: _MenuAction.manageCategories,
            child: Text('Quản lý Danh mục'),
          ),
          const PopupMenuItem(
            value: _MenuAction.search,
            child: Text('Tìm kiếm'),
          ),
          const PopupMenuItem(
            value: _MenuAction.sort,
            child: Text('Sắp xếp công việc'),
          ),
          const PopupMenuItem(value: _MenuAction.printTasks, child: Text('In')),
          PopupMenuItem(
            value: _MenuAction.toggleCompact,
            child: Row(
              children: const [
                Expanded(child: Text('Hiển thị chế độ gọn')),
                Icon(Icons.workspace_premium, color: Colors.amber),
              ],
            ),
          ),
          if (!isPro)
            const PopupMenuItem(
              value: _MenuAction.upgradePro,
              child: Text('Nâng cấp lên Pro'),
            ),
        ];
      },
    );
  }

  void _onMenuAction(_MenuAction a) async {
    switch (a) {
      case _MenuAction.manageCategories:
        await Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => CategoryManagerScreen(tasks: _items),
          ),
        );
        break;
      case _MenuAction.search:
        showSearch(
          context: context,
          delegate: TaskSearchDelegate(
            _items,
            onTapTask: (_) => Navigator.pop(context),
          ),
        );
        break;
      case _MenuAction.sort:
        final picked = await _showSortDialog();
        if (picked != null) setState(() => _sort = picked);
        break;
      case _MenuAction.printTasks:
        await _showExportDialog();
        break;
      case _MenuAction.toggleCompact:
        setState(() => _compact = !_compact);
        break;
      case _MenuAction.upgradePro:
        await Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const UpgradeProDemoScreen()),
        );
        setState(() {});
        break;
    }
  }

  Future<SortOption?> _showSortDialog() async {
    SortOption temp = _sort;
    return showDialog<SortOption>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Các nhiệm vụ được sắp xếp theo'),
        content: StatefulBuilder(
          builder: (_, setS) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final opt in SortOption.values)
                RadioListTile<SortOption>(
                  value: opt,
                  groupValue: temp,
                  onChanged: (v) => setS(() => temp = v!),
                  title: Text(
                    {
                      SortOption.dueDate: 'Ngày và giờ đến hạn',
                      SortOption.createdNewestBottom:
                          'Thời gian tạo (Mới nhất dưới cùng)',
                      SortOption.createdNewestTop:
                          'Thời gian tạo (Mới nhất trên cùng)',
                      SortOption.az: 'Bảng chữ cái A-Z',
                      SortOption.za: 'Bảng chữ cái Z-A',
                      SortOption.manual: 'Thủ công (nhấn & giữ để sắp xếp)',
                    }[opt]!,
                  ),
                ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('HUỶ'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, temp),
            child: const Text('CHỌN'),
          ),
        ],
      ),
    );
  }

  // -------------------- BODY --------------------
  Widget _buildTabView(BuildContext context) {
    switch (_tabIndex) {
      case 0:
        return MenuTab(
          onOpenCategories: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => CategoryManagerScreen(tasks: _items),
            ),
          ),
          onUpgradePro: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const UpgradeProDemoScreen()),
          ),
        );
      case 2:
        return CalendarTab(tasks: _items);
      case 3:
        return MeTab(
          tasks: _items,
          onUpgrade: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const UpgradeProDemoScreen()),
          ),
        );
      default:
        return _buildTasksView(context);
    }
  }

  Future<void> _openTaskDetail(Task task) async {
    final detailCopy = task.clone();
    final result = await Navigator.of(context).push<Task>(
      TaskDetailScreen.route(detailCopy),
    );
    if (result != null) {
      result
        ..id = task.id
        ..createdAt = task.createdAt;
      final index = _items.indexWhere((t) => t.id == task.id);
      if (index != -1) {
        setState(() {
          _items[index] = result;
        });
      }
      await _updateTask(result);
    }
  }

  Future<void> _showExportDialog() async {
    final tasks = _filtered;
    if (tasks.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không có nhiệm vụ nào để xuất')),
      );
      return;
    }

    final buffer = StringBuffer();
    for (final task in tasks) {
      final status = task.done ? '✓' : '•';
      final due = _formatDueLabel(task);
      buffer.writeln('$status ${task.title} (${due ?? 'Không hạn'})');
    }

    await showDialog<void>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Xuất danh sách nhiệm vụ'),
        content: ConstrainedBox(
          constraints: const BoxConstraints(maxHeight: 260),
          child: SingleChildScrollView(
            child: SelectableText(buffer.toString()),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('ĐÓNG')),
        ],
      ),
    );
  }

  Widget _buildTasksView(BuildContext context) {
    final list = _filtered;
    final hasData = list.isNotEmpty;

    ChoiceChip _chip(String text, bool selected, VoidCallback onTap) {
      final s = Theme.of(context).colorScheme;
      final bg = selected ? s.primary : s.primaryContainer;
      final fg = selected ? s.onPrimary : s.onPrimaryContainer;
      return ChoiceChip(
        label: Text(
          text,
          style: TextStyle(color: fg, fontWeight: FontWeight.w700),
        ),
        selected: selected,
        selectedColor: bg,
        backgroundColor: bg.withOpacity(selected ? 1 : .7),
        onSelected: (_) => onTap(),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        showCheckmark: selected,
      );
    }

    final chipBar = AnimatedOpacity(
      duration: const Duration(milliseconds: 250),
      opacity: hasData ? 1 : .4,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(
          children: [
            _chip('Tất cả', filter == null, () => setState(() => filter = null)),
            const SizedBox(width: 8),
            _chip(
              'Công việc',
              filter == TaskCategory.work,
              () => setState(() => filter = TaskCategory.work),
            ),
            const SizedBox(width: 8),
            _chip(
              'Cá nhân',
              filter == TaskCategory.personal,
              () => setState(() => filter = TaskCategory.personal),
            ),
          ],
        ),
      ),
    );

    final listView = (_sort == SortOption.manual)
        ? ReorderableListView.builder(
            key: const PageStorageKey('manual-list'),
            padding: const EdgeInsets.only(bottom: 100),
            itemCount: list.length,
            onReorder: (oldIndex, newIndex) {
              // Lưu ý: khi có filter, thứ tự _items và list khác nhau.
              // Ở phiên bản MVP, chỉ nên dùng "Thủ công" khi filter == null để tránh lẫn chỉ số.
              if (filter != null) return;
              setState(() {
                if (newIndex > oldIndex) newIndex -= 1;
                final item = _items.removeAt(oldIndex);
                _items.insert(newIndex, item);
              });
            },
            itemBuilder: (ctx, i) {
              final t = list[i];
              return Dismissible(
                key: ValueKey(t.id),
                background: Container(color: Colors.redAccent.withOpacity(.2)),
                onDismissed: (_) async => await _deleteTaskById(t.id),
                child: AnimatedSize(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeInOutCubic,
                  child: TaskItem(
                    compact: _compact,
                    task: t,
                    onToggleDone: () async {
                      t.done = !t.done;
                      await _updateTask(t);
                      setState(() {});
                    },
                    onOpenDetail: () => _openTaskDetail(t),
                    onToggleFavorite: () async {
                      t.favorite = !t.favorite;
                      await _updateTask(t);
                      setState(() {});
                    },
                  ),
                ),
              );
            },
          )
        : ListView.builder(
            key: ValueKey('list-${filter?.name ?? 'all'}-${_sort.name}-${_compact ? 'compact' : 'cozy'}'),
            padding: const EdgeInsets.only(bottom: 100),
            itemCount: list.length,
            itemBuilder: (ctx, i) {
              final t = list[i];
              return AnimatedSize(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOutCubic,
                child: TaskItem(
                  compact: _compact,
                  task: t,
                  onToggleDone: () async {
                    t.done = !t.done;
                    await _updateTask(t);
                    setState(() {});
                  },
                  onOpenDetail: () => _openTaskDetail(t),
                  onToggleFavorite: () async {
                    t.favorite = !t.favorite;
                    await _updateTask(t);
                    setState(() {});
                  },
                ),
              );
            },
          );

    return KeyedSubtree(
      key: ValueKey('tasks-${filter?.name ?? 'all'}-${_sort.name}-${_items.length}'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildOverviewCard(context),
          chipBar,
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 350),
              switchInCurve: Curves.easeOutCubic,
              switchOutCurve: Curves.easeInCubic,
              transitionBuilder: (child, animation) {
                final offsetAnimation = Tween<Offset>(
                  begin: const Offset(0, .04),
                  end: Offset.zero,
                ).animate(animation);
                return FadeTransition(
                  opacity: animation,
                  child: SlideTransition(position: offsetAnimation, child: child),
                );
              },
              child: hasData
                  ? listView
                  : KeyedSubtree(key: const ValueKey('empty'), child: _emptyState(context)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewCard(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final total = _items.length;
    final completed = _items.where((t) => t.done).length;
    final pending = total - completed;
    final today = DateTime.now();
    final dueToday = _items.where((t) {
      if (t.dueDate == null || t.done) return false;
      return DateUtils.isSameDay(t.dueDate, today);
    }).length;
    final nextTask = _nextDueTask();
    final nextLabel = nextTask == null
        ? 'Tạo nhiệm vụ mới để bắt đầu ngày làm việc.'
        : 'Tiếp theo: ${nextTask.title}\n${_formatDueLabel(nextTask) ?? 'Không có hạn cụ thể'}';

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeOutCubic,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              scheme.primaryContainer.withOpacity(.85),
              scheme.surface,
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(28),
          boxShadow: [
            BoxShadow(
              color: scheme.primary.withOpacity(.18),
              blurRadius: 28,
              offset: const Offset(0, 16),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Tổng quan hôm nay',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  _metricStat(
                    context,
                    label: 'Đang mở',
                    value: pending,
                    icon: Icons.circle_outlined,
                    color: scheme.primary,
                  ),
                  const SizedBox(width: 12),
                  _metricStat(
                    context,
                    label: 'Hoàn thành',
                    value: completed,
                    icon: Icons.check_circle,
                    color: scheme.secondary,
                  ),
                  const SizedBox(width: 12),
                  _metricStat(
                    context,
                    label: 'Đến hạn hôm nay',
                    value: dueToday,
                    icon: Icons.today,
                    color: scheme.tertiary,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 350),
                transitionBuilder: (child, animation) => FadeTransition(
                  opacity: animation,
                  child: child,
                ),
                child: Text(
                  nextLabel,
                  key: ValueKey(nextLabel),
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _metricStat(
    BuildContext context, {
    required String label,
    required int value,
    required IconData icon,
    required Color color,
  }) {
    final textTheme = Theme.of(context).textTheme;
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: color.withOpacity(.12),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(height: 6),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 250),
              transitionBuilder: (child, animation) => ScaleTransition(
                scale: animation,
                child: child,
              ),
              child: Text(
                '$value',
                key: ValueKey('$label-$value'),
                style: textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: color,
                ),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: textTheme.labelLarge?.copyWith(color: color.withOpacity(.9)),
            ),
          ],
        ),
      ),
    );
  }

  Task? _nextDueTask() {
    final now = DateTime.now();
    final upcoming = _items.where((t) {
      if (t.done) return false;
      final due = _dueDateTime(t);
      return due != null && !due.isBefore(now);
    }).toList()
      ..sort((a, b) {
        final ad = _dueDateTime(a)!;
        final bd = _dueDateTime(b)!;
        return ad.compareTo(bd);
      });
    if (upcoming.isNotEmpty) {
      return upcoming.first;
    }

    final overdue = _items.where((t) {
      if (t.done) return false;
      final due = _dueDateTime(t);
      return due != null && due.isBefore(now);
    }).toList()
      ..sort((a, b) => _dueDateTime(a)!.compareTo(_dueDateTime(b)!));
    if (overdue.isNotEmpty) return overdue.first;

    final pending = _items.where((t) => !t.done).toList()
      ..sort((a, b) => a.createdAt.compareTo(b.createdAt));
    return pending.isNotEmpty ? pending.first : null;
  }

  DateTime? _dueDateTime(Task task) {
    final due = task.dueDate;
    if (due == null) return null;
    if (task.timeOfDay != null) {
      return DateTime(
        due.year,
        due.month,
        due.day,
        task.timeOfDay!.hour,
        task.timeOfDay!.minute,
      );
    }
    return DateTime(due.year, due.month, due.day, 23, 59);
  }

  String? _formatDueLabel(Task task) {
    final due = task.dueDate;
    if (due == null) return null;
    final dd = due.day.toString().padLeft(2, '0');
    final mm = due.month.toString().padLeft(2, '0');
    final yyyy = due.year.toString();
    final dateLabel = '$dd/$mm/$yyyy';
    if (task.timeOfDay != null) {
      final hh = task.timeOfDay!.hour.toString().padLeft(2, '0');
      final minutes = task.timeOfDay!.minute.toString().padLeft(2, '0');
      return '$hh:$minutes · $dateLabel';
    }
    return dateLabel;
  }

  Widget _emptyState(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.laptop_chromebook, size: 120),
              const SizedBox(height: 16),
              Text(
                'Không có nhiệm vụ nào trong danh mục này.\nNhấp vào + để tạo nhiệm vụ của bạn.',
                style: Theme.of(context).textTheme.titleMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
}

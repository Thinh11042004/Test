import 'package:flutter/material.dart';
import '../../models/task.dart';

class CalendarTab extends StatefulWidget {
  final List<Task> tasks;
  const CalendarTab({super.key, required this.tasks});

  @override
  State<CalendarTab> createState() => _CalendarTabState();
}

class _CalendarTabState extends State<CalendarTab> {
  DateTime _selected = DateTime.now();

  bool _sameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  @override
  Widget build(BuildContext context) {
    final dayTasks =
        widget.tasks.where((t) => t.dueDate != null && _sameDay(t.dueDate!, _selected)).toList();

    final scheme = Theme.of(context).colorScheme;

    return Container(
      color: scheme.surface,
      child: Column(
        children: [
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  scheme.primary.withOpacity(.85),
                  scheme.secondary.withOpacity(.75),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: CalendarDatePicker(
            initialDate: _selected,
            firstDate: DateTime(2000),
            lastDate: DateTime(2100),
            onDateChanged: (d) => setState(() => _selected = d),
          ),
        ),
        Expanded(
          child: dayTasks.isEmpty
              ? const SizedBox.shrink()
              : ListView.builder(
                  padding: const EdgeInsets.only(bottom: 90, top: 8),
                  itemCount: dayTasks.length,
                  itemBuilder: (ctx, i) => _calendarTaskCard(context, dayTasks[i]),
                ),
        ),
        ],
    ));
  }

  Widget _calendarTaskCard(BuildContext context, Task t) {
    final time = t.timeOfDay == null
        ? null
        : '${t.timeOfDay!.hour.toString().padLeft(2, '0')}:${t.timeOfDay!.minute.toString().padLeft(2, '0')}';
    final scheme = Theme.of(context).colorScheme;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            scheme.primaryContainer.withOpacity(.8),
            scheme.surface,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(color: scheme.primary.withOpacity(.1), blurRadius: 14, offset: const Offset(0, 8)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 6,
            height: 70,
            decoration: BoxDecoration(
              color: scheme.primary,
              borderRadius: const BorderRadius.only(topLeft: Radius.circular(18), bottomLeft: Radius.circular(18)),
            ),
          ),
          Expanded(
            child: ListTile(
              title: Text(t.title, style: TextStyle(fontWeight: FontWeight.w700, color: scheme.onSurface)),
              subtitle: Row(
                children: [
                  if (time != null) ...[
                    const SizedBox(width: 2),
                    Text(time, style: TextStyle(color: scheme.primary)),
                    const SizedBox(width: 8),
                  ],
                  Icon(Icons.notifications_none, size: 16, color: scheme.outline),
                  const SizedBox(width: 8),
                  Icon(Icons.share_outlined, size: 16, color: scheme.outline),
                ],
              ),
              trailing: Icon(Icons.flag_outlined, color: scheme.secondary),
            ),
          ),
        ],
      ),
    );
  }
}

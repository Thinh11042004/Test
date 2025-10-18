import 'package:flutter/material.dart';

import '../../services/settings_service.dart';
import '../theme/theme_picker_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  @override
  Widget build(BuildContext context) {
    final service = SettingsService.instance;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Cài đặt')),
      body: AnimatedBuilder(
        animation: service,
        builder: (context, _) {
          final state = service.state;
          final reminderLabel = MaterialLocalizations.of(context).formatTimeOfDay(state.reminderTime);

          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
            children: [
              Text(
                'Cài đặt chung',
                style: textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 12),
              SwitchListTile.adaptive(
                value: state.notificationsEnabled,
                onChanged: service.setNotificationsEnabled,
                title: const Text('Bật bản tin nhắc việc'),
                subtitle: const Text('Nhận thông báo tổng hợp các nhiệm vụ chưa hoàn thành.'),
                secondary: const Icon(Icons.notifications_active_outlined),
              ),
              ListTile(
                leading: const Icon(Icons.schedule),
                title: const Text('Thời gian gửi nhắc nhở'),
                subtitle: Text('Gửi vào $reminderLabel mỗi ngày'),
                enabled: state.notificationsEnabled,
                trailing: const Icon(Icons.chevron_right),
                onTap: state.notificationsEnabled
                    ? () async {
                        final newTime = await showTimePicker(
                          context: context,
                          initialTime: state.reminderTime,
                        );
                        if (newTime != null) {
                          service.setReminderTime(newTime);
                        }
                      }
                    : null,
              ),
              SwitchListTile.adaptive(
                value: state.autoArchiveCompleted,
                onChanged: service.setAutoArchiveCompleted,
                title: const Text('Tự động lưu trữ nhiệm vụ hoàn thành'),
                subtitle: const Text('Nhiệm vụ đã xong sẽ chuyển vào kho lưu trữ sau 24 giờ.'),
                secondary: const Icon(Icons.archive_outlined),
              ),
              SwitchListTile.adaptive(
                value: state.calendarSync,
                onChanged: service.setCalendarSync,
                title: const Text('Đồng bộ với lịch cá nhân'),
                subtitle: const Text('Xuất các nhiệm vụ quan trọng sang ứng dụng lịch của bạn.'),
                secondary: const Icon(Icons.calendar_month_outlined),
              ),
              SwitchListTile.adaptive(
                value: state.focusMode,
                onChanged: service.setFocusMode,
                title: const Text('Chế độ tập trung'),
                subtitle: const Text('Tạm ẩn thông báo không quan trọng trong giờ làm việc.'),
                secondary: const Icon(Icons.do_not_disturb_on_total_silence),
              ),
              const SizedBox(height: 24),
              Text(
                'Tuỳ chỉnh giao diện',
                style: textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 12),
              Card(
                margin: EdgeInsets.zero,
                child: ListTile(
                  leading: const Icon(Icons.color_lens_outlined),
                  title: const Text('Chọn chủ đề và màu nhấn'),
                  subtitle: const Text('Áp dụng ngay cho toàn bộ ứng dụng.'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const ThemePickerScreen()),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Dữ liệu & riêng tư',
                style: textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 12),
              Card(
                margin: EdgeInsets.zero,
                child: ListTile(
                  leading: const Icon(Icons.restore_outlined),
                  title: const Text('Khôi phục mặc định tiện ích'),
                  subtitle: const Text('Đặt lại các tuỳ chọn nhắc nhở và chế độ tập trung.'),
                  onTap: () async {
                    final confirm = await showDialog<bool>(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('Khôi phục mặc định?'),
                        content: const Text('Mọi tuỳ chọn tiện ích sẽ trở về giá trị ban đầu.'),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.of(context).pop(false),
                            child: const Text('Huỷ'),
                          ),
                          FilledButton(
                            onPressed: () => Navigator.of(context).pop(true),
                            child: const Text('Đồng ý'),
                          ),
                        ],
                      ),
                    );

                    if (confirm == true) {
                      await service.restoreProductivityDefaults();
                      if (!mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Đã khôi phục cài đặt tiện ích.')),
                      );
                    }
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

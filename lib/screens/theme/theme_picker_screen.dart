import 'package:flutter/material.dart';

class ThemePickerScreen extends StatelessWidget {
  const ThemePickerScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chủ đề')),
      body: Center(
        child: Text('Chọn chủ đề (sẽ triển khai thực tế ở đây).'),
      ),
    );
  }
}

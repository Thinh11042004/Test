import 'package:flutter/material.dart';

class UtilitiesScreen extends StatelessWidget {
  const UtilitiesScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tiện ích')),
      body: Center(
        child: Text('Danh sách tiện ích sẽ hiển thị ở đây.'),
      ),
    );
  }
}

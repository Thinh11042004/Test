import 'package:flutter/material.dart';

class FAQScreen extends StatelessWidget {
  const FAQScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hỏi Đáp')),
      body: Center(
        child: Text('Các câu hỏi thường gặp sẽ hiển thị ở đây.'),
      ),
    );
  }
}

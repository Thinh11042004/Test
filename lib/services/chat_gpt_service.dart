import 'dart:convert';

import 'package:http/http.dart' as http;

import 'settings_service.dart';

class ChatGptException implements Exception {
  final String message;
  ChatGptException(this.message);

  @override
  String toString() => message;
}

class ChatGptService {
  ChatGptService._();

  static final ChatGptService instance = ChatGptService._();
  final http.Client _client = http.Client();

  Future<String> ask(String prompt) async {
    final apiKey = SettingsService.instance.state.chatGptApiKey;
    if (apiKey.isEmpty) {
      throw ChatGptException('Vui lòng cấu hình OpenAI API key trong mục Cài đặt.');
    }

    final response = await _client.post(
      Uri.parse('https://api.openai.com/v1/chat/completions'),
      headers: {
        'Authorization': 'Bearer $apiKey',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'model': 'gpt-3.5-turbo',
        'messages': [
          {
            'role': 'system',
            'content':
                'You are an assistant that helps Vietnamese to-do app users with productivity tips and feature guidance.'
          },
          {'role': 'user', 'content': prompt},
        ],
        'temperature': 0.7,
        'max_tokens': 600,
      }),
    );

    if (response.statusCode >= 400) {
      String description = 'Không thể kết nối đến ChatGPT (mã lỗi ${response.statusCode}).';
      try {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final error = data['error'];
        if (error is Map<String, dynamic>) {
          final message = error['message'];
          if (message is String && message.isNotEmpty) {
            description = message;
          }
        }
      } catch (_) {}
      throw ChatGptException(description);
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final choices = data['choices'];
    if (choices is List && choices.isNotEmpty) {
      final message = choices.first['message'];
      if (message is Map && message['content'] is String) {
        return (message['content'] as String).trim();
      }
    }

    throw ChatGptException('ChatGPT không trả về kết quả phù hợp.');
  }
}
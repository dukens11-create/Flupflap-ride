import 'package:flutter_test/flutter_test.dart';
import 'package:drive_mobile/main.dart';

void main() {
  testWidgets('renders home placeholders and navigation', (tester) async {
    await tester.pumpWidget(const DriveApp());

    expect(find.text('Drive Home'), findsOneWidget);
    expect(find.text('Features coming soon'), findsOneWidget);
    expect(find.text('Planned features'), findsOneWidget);
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Rides'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);
  });
}

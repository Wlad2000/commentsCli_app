## README

### Опис проєкту

Цей проєкт є додатком на React Native з функціональністю надсилання коментарів та вкладених файлів на сервер через WebSocket. Додаток також працює в режимі офлайн, зберігаючи коментарі до відновлення з'єднання. Крім того, додаток використовує геолокацію пристрою для отримання часу сходу та заходу сонця і динамічно застосовує відповідну тему.

### Основні функції

1. **Надсилання коментарів**: Користувачі можуть надсилати коментарі з використанням HTML-тегів (`<a>`, `<code>`, `<i>`, `<strong>`).
2. **Вкладені файли**: Можливість завантаження зображень та текстових файлів.
3. **Офлайн режим**: Коментарі зберігаються та надсилаються на сервер при відновленні з'єднання.
4. **Геолокація**: Отримання геолокації пристрою та використання даних для визначення часу сходу та заходу сонця.
5. **Динамічна тема**: Додаток автоматично застосовує тему залежно від часу доби.

### Встановлення та запуск

#### Серверна частина
(https://github.com/Wlad2000/commentsServer)
(Запускається ОКРЕМО)
1. Переконайтесь, що у вас встановлено Node.js.
2. Перейдіть у директорію з сервером.
3. Встановіть залежності:

```bash
npm install
```

4. Запустіть сервер:

```bash
npm run start
```

#### Клієнтська частина (React Native)

1. Переконайтесь, що у вас встановлено Node.js, React Native CLI та Android/iOS емулятор або підключений пристрій.
2. Перейдіть у директорію з клієнтським додатком.
3. Встановіть залежності:

```bash
npm install
```

4. Запустіть додаток:

```bash
npm start
```

5. Відкрийте додаток на емуляторі або пристрої:

   - Для iOS:

     ```bash
     npx react-native run-ios
     ```

   - Для Android:

     ```bash
     npx react-native run-android
     ```

### Використання

1. Заповніть поля форми: ім'я користувача, email та текст коментаря.
2. За потреби, додайте вкладений файл (зображення або текстовий файл).
3. Натисніть "Submit" для надсилання коментаря та файлу на сервер.
4. У разі відсутності мережі коментарі будуть збережені та надіслані при відновленні з'єднання.
5. Додаток автоматично визначає ваше місцезнаходження та час сходу/заходу сонця, застосовуючи відповідну тему.

### Залежності

- React Native
- @react-native-community/geolocation
- @react-native-async-storage/async-storage
- @react-native-community/netinfo
- react-native-document-picker
- react-native-fs
- WebSocket
...
### Підтримка

Якщо у вас виникли запитання або проблеми, будь ласка, створіть issue у репозиторії або зв'яжіться з нами електронною поштою.

## ПРИМІТКА
ERROR IOS in CommentForm.jsx => No +[RCTConvert WKDataDetectorTypes:] function found - dataDetectorTypes prop problem.
### FIX:
create a file /node_modules/react-native-webview/apple/RCTConvert+WKDataDetectorTypes.h:
   ```objc
#import <WebKit/WebKit.h>

#import <React/RCTConvert.h>

#if TARGET_OS_IPHONE
@interface RCTConvert (WKDataDetectorTypes)

+ (WKDataDetectorTypes)WKDataDetectorTypes:(id)json;

@end
#endif // TARGET_OS_IPHONE
   ```
create a file /node_modules/react-native-webview/apple/RCTConvert+WKDataDetectorTypes.m:
   ```objc
#import <WebKit/WebKit.h>

#import <React/RCTConvert.h>

#if TARGET_OS_IPHONE

@implementation RCTConvert (WKDataDetectorTypes)

RCT_MULTI_ENUM_CONVERTER(
     WKDataDetectorTypes,
     (@{
       @"none" : @(WKDataDetectorTypeNone),
       @"phoneNumber" : @(WKDataDetectorTypePhoneNumber),
       @"link" : @(WKDataDetectorTypeLink),
       @"address" : @(WKDataDetectorTypeAddress),
       @"calendarEvent" : @(WKDataDetectorTypeCalendarEvent),
       @"trackingNumber" : @(WKDataDetectorTypeTrackingNumber),
       @"flightNumber" : @(WKDataDetectorTypeFlightNumber),
       @"lookupSuggestion" : @(WKDataDetectorTypeLookupSuggestion),
       @"all" : @(WKDataDetectorTypeAll),
     }),
     WKDataDetectorTypeNone,
     unsignedLongLongValue)

@end

#endif // TARGET_OS_IPHONE
  ```

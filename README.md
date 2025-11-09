```
cp .env.example .env
```




# **Документация: Система напоминаний (Laravel 11 + Vue 3 + Vuetify 3)**  

## **1. Структура проекта**  
```
project/
├── backend/               # Laravel 11
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── ReminderController.php
│   │   ├── Models/
│   │   │   └── Reminder.php
│   │   └── Providers/
│   ├── database/
│   │   ├── migrations/
│   │   │   └── 2024_05_01_000000_create_reminders_table.php
│   │   └── seeders/
│   └── routes/
│       └── api.php
│
├── frontend/              # Vue 3 + Vuetify 3
│   ├── src/
│   │   ├── api/
│   │   │   └── reminders.js
│   │   ├── components/
│   │   │   └── Reminders/
│   │   │       └── ReminderList.vue
│   │   ├── stores/
│   │   │   └── reminderStore.js  # (если используем Pinia)
│   │   └── views/
│   │       └── RemindersView.vue
│   └── App.vue
│
└── README.md              # Общая документация
```

---

## **2. Backend (Laravel 11)**  

### **Миграция для таблицы `reminders`**  
```php
// database/migrations/2024_05_01_000000_create_reminders_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reminders', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamp('reminder_time');  // Когда сработает уведомление
            $table->timestamp('event_time');     // Время реального события
            $table->enum('repeat', ['none', 'daily', 'weekly', 'monthly', 'yearly'])->default('none');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reminders');
    }
};
```

### **Модель `Reminder.php`**  
```php
// app/Models/Reminder.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'reminder_time',
        'event_time',
        'repeat',
    ];

    protected $casts = [
        'reminder_time' => 'datetime',
        'event_time' => 'datetime',
    ];
}
```

### **Контроллер `ReminderController.php`**  
```php
// app/Http/Controllers/ReminderController.php

namespace App\Http\Controllers;

use App\Models\Reminder;
use Illuminate\Http\Request;

class ReminderController extends Controller
{
    public function index()
    {
        return Reminder::orderBy('event_time', 'asc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_time' => 'required|date',
            'reminder_time' => 'required|date',
            'repeat' => 'required|in:none,daily,weekly,monthly,yearly',
        ]);

        return Reminder::create($validated);
    }

    public function update(Request $request, Reminder $reminder)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'event_time' => 'sometimes|date',
            'reminder_time' => 'sometimes|date',
            'repeat' => 'sometimes|in:none,daily,weekly,monthly,yearly',
        ]);

        $reminder->update($validated);
        return $reminder;
    }

    public function destroy(Reminder $reminder)
    {
        $reminder->delete();
        return response()->noContent();
    }
}
```

### **API-маршруты (`api.php`)**  
```php
// routes/api.php

use App\Http\Controllers\ReminderController;
use Illuminate\Support\Facades\Route;

Route::prefix('reminders')->group(function () {
    Route::get('/', [ReminderController::class, 'index']);
    Route::post('/', [ReminderController::class, 'store']);
    Route::put('/{reminder}', [ReminderController::class, 'update']);
    Route::delete('/{reminder}', [ReminderController::class, 'destroy']);
});
```

---

## **3. Frontend (Vue 3 + Vuetify 3)**  

### **API-клиент (`reminders.js`)**  
```javascript
// src/api/reminders.js

import axios from 'axios';

export default {
    async getReminders() {
        const response = await axios.get('/api/reminders');
        return response.data;
    },
    async addReminder(data) {
        const response = await axios.post('/api/reminders', data);
        return response.data;
    },
    async updateReminder(id, data) {
        const response = await axios.put(`/api/reminders/${id}`, data);
        return response.data;
    },
    async deleteReminder(id) {
        await axios.delete(`/api/reminders/${id}`);
    }
};
```

### **Компонент `ReminderList.vue`**  
```vue
<!-- src/components/Reminders/ReminderList.vue -->

<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <v-btn color="primary" @click="openCreateDialog">
                    <v-icon start>mdi-plus</v-icon>
                    Добавить напоминание
                </v-btn>
            </v-col>
        </v-row>

        <!-- Диалог создания/редактирования -->
        <v-dialog v-model="showDialog" max-width="600">
            <v-card>
                <v-card-title>
                    {{ editingId ? 'Редактировать напоминание' : 'Новое напоминание' }}
                </v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="saveReminder">
                        <v-text-field v-model="form.title" label="Название" required></v-text-field>
                        <v-textarea v-model="form.description" label="Описание" rows="2"></v-textarea>
                        <v-date-picker v-model="form.date" :min="new Date()" title="Дата" required></v-date-picker>
                        <v-text-field v-model="form.hour" label="Час (00-23)" type="number" min="0" max="23"></v-text-field>
                        <v-select v-model="form.repeat" :items="repeatOptions" label="Повторение"></v-select>
                        <v-select v-model="form.reminderOffset" :items="offsetOptions" label="Напомнить заранее"></v-select>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="error" @click="showDialog = false">Отмена</v-btn>
                            <v-btn color="primary" type="submit">Сохранить</v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>

        <!-- Список напоминаний -->
        <v-list lines="two">
            <v-list-item v-for="reminder in sortedReminders" :key="reminder.id">
                <template v-slot:prepend>
                    <v-icon :color="getReminderColor(reminder)">mdi-alarm</v-icon>
                </template>
                <v-list-item-title>{{ reminder.title }}</v-list-item-title>
                <v-list-item-subtitle>
                    {{ formatDateTime(reminder.event_time) }}
                    <span v-if="reminder.reminder_time !== reminder.event_time" class="text-caption">
                        (напомнит {{ formatDateTime(reminder.reminder_time) }})
                    </span>
                </v-list-item-subtitle>
                <template v-slot:append>
                    <v-btn icon variant="text" color="error" @click="deleteReminder(reminder.id)">
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                </template>
            </v-list-item>
        </v-list>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { format, parseISO, isBefore } from 'date-fns';
import { ru } from 'date-fns/locale';
import remindersApi from '@/api/reminders';

const reminders = ref([]);
const showDialog = ref(false);
const editingId = ref(null);

const form = ref({
    title: '',
    description: '',
    date: new Date(),
    hour: '12',
    repeat: 'none',
    reminderOffset: 30 // минуты до события
});

const repeatOptions = [
    { value: 'none', text: 'Не повторяется' },
    { value: 'daily', text: 'Ежедневно' },
    { value: 'weekly', text: 'Еженедельно' },
    { value: 'monthly', text: 'Ежемесячно' },
    { value: 'yearly', text: 'Ежегодно' }
];

const offsetOptions = [
    { value: 5, text: 'За 5 минут' },
    { value: 15, text: 'За 15 минут' },
    { value: 30, text: 'За 30 минут' },
    { value: 60, text: 'За 1 час' },
    { value: 1440, text: 'За 1 день' }
];

const sortedReminders = computed(() => {
    return [...reminders.value].sort((a, b) => new Date(a.event_time) - new Date(b.event_time));
});

const fetchReminders = async () => {
    reminders.value = await remindersApi.getReminders();
};

const saveReminder = async () => {
    const formattedHour = form.value.hour.toString().padStart(2, '0');
    const eventTime = new Date(form.value.date);
    eventTime.setHours(formattedHour, 0, 0);

    const reminderTime = new Date(eventTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - form.value.reminderOffset);

    const reminderData = {
        title: form.value.title,
        description: form.value.description,
        event_time: eventTime.toISOString(),
        reminder_time: reminderTime.toISOString(),
        repeat: form.value.repeat
    };

    if (editingId.value) {
        await remindersApi.updateReminder(editingId.value, reminderData);
    } else {
        await remindersApi.addReminder(reminderData);
    }

    showDialog.value = false;
    fetchReminders();
};

const deleteReminder = async (id) => {
    if (confirm('Удалить напоминание?')) {
        await remindersApi.deleteReminder(id);
        fetchReminders();
    }
};

const formatDateTime = (dateString) => {
    return format(parseISO(dateString), 'dd.MM.yyyy HH:mm', { locale: ru });
};

const getReminderColor = (reminder) => {
    return isBefore(new Date(reminder.event_time), new Date()) ? 'error' : 'primary';
};

onMounted(fetchReminders);
</script>
```

---

## **4. Жизненный цикл работы**  
1. **Создание напоминания**:
   - Пользователь заполняет форму (название, описание, дату, время, повторение, смещение напоминания).  
   - Фронт отправляет запрос `POST /api/reminders`.  
   - Бэк сохраняет в БД `event_time` и `reminder_time` (рассчитанный по смещению).  

2. **Просмотр списка**:
   - При загрузке страницы фронт делает `GET /api/reminders`.  
   - Напоминания сортируются по `event_time`.  

3. **Редактирование/удаление**:
   - Аналогично, но с `PUT` и `DELETE` запросами.  

---

## **5. Дополнительные улучшения**  
- **Уведомления в реальном времени** (через WebSockets или Polling).  
- **Повторяющиеся события** (крон-задача на бэкенде для генерации новых напоминаний).  
- **Категории и теги** (расширение модели `Reminder`).  

---


# **Документация: Система напоминаний с Telegram, консольными командами и ISPmanager**  
*(Laravel 11 + Vue 3 + Vuetify 3 + Telegram Bot + Cron + ISPmanager)*  

---

## **1. Обновленная структура проекта**  
```
project/
├── backend/
│   ├── app/
│   │   ├── Console/
│   │   │   ├── Commands/
│   │   │   │   ├── SendRemindersCommand.php
│   │   │   │   └── CheckTelegramUpdatesCommand.php
│   │   ├── Services/
│   │   │   ├── TelegramService.php
│   │   │   └── ReminderService.php
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── ReminderController.php
│   │   │   │   └── TelegramController.php
│   │   ├── Models/
│   │   │   └── Reminder.php
│   │   └── Providers/
│   ├── config/
│   │   └── telegram.php
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php
│   └── .env
│
├── frontend/  # (Без изменений)
│
└── README.md
```

---

## **2. Интеграция Telegram**  

### **2.1. Настройка конфига Telegram**  
```php
// config/telegram.php

return [
    'bot_token' => env('TELEGRAM_BOT_TOKEN'),
    'chat_id' => env('TELEGRAM_CHAT_ID'), // Для личных уведомлений
    'webhook_url' => env('TELEGRAM_WEBHOOK_URL'),
];
```

### **2.2. Сервис для работы с Telegram**  
```php
// app/Services/TelegramService.php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class TelegramService
{
    public function sendMessage(string $text, ?string $chatId = null): bool
    {
        $chatId = $chatId ?? config('telegram.chat_id');
        $url = "https://api.telegram.org/bot" . config('telegram.bot_token') . "/sendMessage";

        $response = Http::post($url, [
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'HTML',
        ]);

        return $response->successful();
    }

    public function setWebhook(string $url): bool
    {
        $response = Http::get("https://api.telegram.org/bot" . config('telegram.bot_token') . "/setWebhook", [
            'url' => $url,
        ]);

        return $response->json('ok', false);
    }
}
```

### **2.3. Контроллер для вебхука**  
```php
// app/Http/Controllers/TelegramController.php

namespace App\Http\Controllers;

use App\Services\TelegramService;
use Illuminate\Http\Request;

class TelegramController extends Controller
{
    public function handleWebhook(Request $request, TelegramService $telegram)
    {
        $update = $request->all();
        
        // Обработка команд из Telegram
        if (isset($update['message']['text'])) {
            $message = $update['message']['text'];
            $chatId = $update['message']['chat']['id'];

            if ($message === '/start') {
                $telegram->sendMessage("Привет! Я бот для напоминаний. Используй /help для списка команд.", $chatId);
            }
        }

        return response()->json(['status' => 'ok']);
    }
}
```

### **2.4. Добавление маршрута**  
```php
// routes/web.php

use App\Http\Controllers\TelegramController;

Route::post('/telegram/webhook', [TelegramController::class, 'handleWebhook']);
```

---

## **3. Консольные команды для Cron**  

### **3.1. Команда для отправки напоминаний**  
```php
// app/Console/Commands/SendRemindersCommand.php

namespace App\Console\Commands;

use App\Models\Reminder;
use App\Services\TelegramService;
use Illuminate\Console\Command;

class SendRemindersCommand extends Command
{
    protected $signature = 'reminders:send';
    protected $description = 'Отправляет уведомления о предстоящих событиях';

    public function handle(TelegramService $telegram)
    {
        $now = now()->format('Y-m-d H:i:00');
        
        $reminders = Reminder::where('reminder_time', '<=', $now)
            ->where('is_sent', false)
            ->get();

        foreach ($reminders as $reminder) {
            $message = "🔔 Напоминание: {$reminder->title}\n"
                . "⏰ Время события: " . $reminder->event_time->format('d.m.Y H:i');

            if ($telegram->sendMessage($message)) {
                $reminder->update(['is_sent' => true]);
                $this->info("Отправлено: {$reminder->title}");
            }
        }
    }
}
```

### **3.2. Команда для проверки обновлений Telegram**  
```php
// app/Console/Commands/CheckTelegramUpdatesCommand.php

namespace App\Console\Commands;

use App\Services\TelegramService;
use Illuminate\Console\Command;

class CheckTelegramUpdatesCommand extends Command
{
    protected $signature = 'telegram:updates';
    protected $description = 'Проверяет новые сообщения в Telegram (Polling)';

    public function handle(TelegramService $telegram)
    {
        $lastUpdateId = cache('telegram_last_update_id', 0);
        $updates = $telegram->getUpdates($lastUpdateId + 1);

        foreach ($updates as $update) {
            // Логика обработки сообщений (аналогично вебхуку)
            cache(['telegram_last_update_id' => $update['update_id']]);
        }
    }
}
```

---

## **4. Настройка Cron в ISPmanager**  

### **4.1. Добавление задач в Cron**  
1. **Открываем ISPmanager** → **"Задачи Cron"** → **"Добавить"**.  
2. Настраиваем:  
   - **Команда**: `php /var/www/project/backend/artisan reminders:send`  
   - **Расписание**: `*/5 * * * *` (каждые 5 минут)  
3. Аналогично для Telegram (если не используем вебхук):  
   - `php /var/www/project/backend/artisan telegram:updates`  

---

## **5. Обновленный ReminderService**  
```php
// app/Services/ReminderService.php

namespace App\Services;

use App\Models\Reminder;
use Carbon\Carbon;

class ReminderService
{
    public function createRepeatedReminders(): void
    {
        $repeatedReminders = Reminder::where('repeat', '!=', 'none')
            ->where('event_time', '<=', now())
            ->get();

        foreach ($repeatedReminders as $reminder) {
            $newEventTime = match ($reminder->repeat) {
                'daily' => Carbon::parse($reminder->event_time)->addDay(),
                'weekly' => Carbon::parse($reminder->event_time)->addWeek(),
                'monthly' => Carbon::parse($reminder->event_time)->addMonth(),
                'yearly' => Carbon::parse($reminder->event_time)->addYear(),
                default => null,
            };

            if ($newEventTime) {
                Reminder::create([
                    'title' => $reminder->title,
                    'description' => $reminder->description,
                    'event_time' => $newEventTime,
                    'reminder_time' => $newEventTime->subMinutes($reminder->reminder_offset),
                    'repeat' => $reminder->repeat,
                ]);
            }
        }
    }
}
```

---

## **6. Доработка фронтенда (Vue 3)**  

### **6.1. Добавление Telegram-уведомлений в форму**  
```vue
<!-- В ReminderList.vue -->
<template>
    <!-- ... -->
    <v-switch v-model="form.send_telegram" label="Уведомить в Telegram"></v-switch>
</template>

<script setup>
const form = ref({
    // ... остальные поля
    send_telegram: true,
});
</script>
```

---

## **7. Проверка работы**  

1. **Тестирование Telegram-бота**:  
   - Отправьте `/start` боту, чтобы проверить подключение.  
   - Настройте вебхук:  
     ```bash
     php artisan telegram:set-webhook "https://ваш-домен/telegram/webhook"
     ```

2. **Проверка Cron**:  
   - Запустите вручную:  
     ```bash
     php artisan reminders:send
     ```
   - Убедитесь, что задачи появляются в ISPmanager.

3. **Повторяющиеся события**:  
   - Добавьте тестовое напоминание с повтором (например, ежедневно).  
   - Запустите:  
     ```bash
     php artisan reminders:generate-repeats
     ```

---

## **8. Итоговая конфигурация**  

| Компонент          | Технология         | Назначение                          |
|--------------------|--------------------|-------------------------------------|
| Бэкенд            | Laravel 11         | API, логика, Telegram, Cron         |
| Фронтенд          | Vue 3 + Vuetify 3  | Интерфейс управления напоминаниями  |
| Хранение данных   | MySQL/PostgreSQL   | Таблицы `reminders`                 |
| Уведомления       | Telegram Bot API   | Отправка в мессенджер               |
| Планировщик       | Cron (ISPmanager)  | Автоматическая отправка             |

---

### **Готово!** 🎉  
Теперь у вас есть:  
✅ Напоминания с уведомлениями в Telegram  
✅ Автоматическая отправка через Cron  
✅ Поддержка повторяющихся событий  
✅ Готовые команды для ISPmanager  

Для дальнейшего развития можно добавить:  
- Категории и теги для напоминаний  
- Подтверждение получения уведомлений  
- Интеграцию с Google Calendar






# Погода по метеосводкам api.met.no


drive:
Используется для получения автомобильных дорог. Это основной тип для маршрутов, предназначенных для автотранспортных средств.
walk:
Этот тип предназначен для пешеходных маршрутов. Он включает в себя только пешеходные дорожки и тропы.
bike:
Используется для велосипедных маршрутов. Включает велосипедные дорожки и другие подходящие пути для велосипедистов.
all:
Позволяет получить все типы дорог, включая автомобильные, пешеходные и велосипедные.
public_transport:
Этот тип используется для получения маршрутов общественного транспорта, таких как автобусы и трамваи.
none:
Не возвращает никаких рёбер в графе, что может быть полезно для создания пустого графа.
drive_service:
Включает дороги, доступные только для сервисных автомобилей, например, дороги на территории жилых комплексов или коммерческих объектов.
hov:
Для маршрутов с ограниченным доступом, например, полосы для автомобилей с несколькими пассажирами.
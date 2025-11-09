import { createApp } from 'vue'
import GlobalNotifier from '@/components/GlobalNotifier.vue'

const NotifyPlugin = {
  install(app, options) {
    // Получаем vuetify из options
    const vuetify = options?.vuetify
    
    // Создаем отдельное приложение для нотификатора
    const notifyApp = createApp(GlobalNotifier)
    
    // Передаем vuetify в приложение нотификатора
    if (vuetify) {
      notifyApp.use(vuetify)
    }
    
    // Монтируем компонент
    const notifyInstance = notifyApp.mount(document.createElement('div'))
    document.body.appendChild(notifyInstance.$el)

    // Создаем объект $notify
    const notify = (message, options = {}) => {
      return notifyInstance.addNotification(
        message,
        options.type || 'info',
        options.timeout || 5000
      )
    }

    // Добавляем shortcut методы
    notify.success = (message, timeout = 5000) => {
      return notifyInstance.addNotification(message, 'success', timeout)
    }
    
    notify.error = (message, timeout = 8000) => {
      return notifyInstance.addNotification(message, 'error', timeout)
    }
    
    notify.warning = (message, timeout = 6000) => {
      return notifyInstance.addNotification(message, 'warning', timeout)
    }
    
    notify.info = (message, timeout = 4000) => {
      return notifyInstance.addNotification(message, 'info', timeout)
    }

    // Регистрируем глобально
    app.config.globalProperties.$notify = notify
    app.provide('$notify', notify)
    
    console.log('🔔 NotifyPlugin installed successfully with Vuetify')
  }
}

export default NotifyPlugin
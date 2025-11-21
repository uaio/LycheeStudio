interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  onClick?: () => void;
}

class NotificationService {
  private isSupported: boolean;
  private permission: NotificationPermission;

  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = 'default';
    this.checkPermission();
  }

  // 检查通知权限
  private async checkPermission() {
    if (!this.isSupported) {
      console.warn('该浏览器不支持系统通知');
      return false;
    }

    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }

  // 请求通知权限
  async requestPermission(): Promise<boolean> {
    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('请求通知权限失败:', error);
      return false;
    }
  }

  // 检查是否有权限
  hasPermission(): boolean {
    return this.isSupported && this.permission === 'granted';
  }

  // 发送成功通知
  showSuccess(title: string, message: string, options?: Partial<NotificationOptions>) {
    this.showNotification({
      title,
      body: message,
      icon: this.getIcon('success'),
      tag: 'success',
      ...options
    });
  }

  // 发送错误通知
  showError(title: string, message: string, options?: Partial<NotificationOptions>) {
    this.showNotification({
      title,
      body: message,
      icon: this.getIcon('error'),
      tag: 'error',
      ...options
    });
  }

  // 发送警告通知
  showWarning(title: string, message: string, options?: Partial<NotificationOptions>) {
    this.showNotification({
      title,
      body: message,
      icon: this.getIcon('warning'),
      tag: 'warning',
      ...options
    });
  }

  // 发送信息通知
  showInfo(title: string, message: string, options?: Partial<NotificationOptions>) {
    this.showNotification({
      title,
      body: message,
      icon: this.getIcon('info'),
      tag: 'info',
      ...options
    });
  }

  // 通用通知方法
  private showNotification(options: NotificationOptions) {
    if (!this.hasPermission()) {
      console.log('通知:', options.title, '-', options.body);
      return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon,
        tag: options.tag,
        requireInteraction: options.tag === 'error'
      });

      if (options.onClick) {
        notification.onclick = () => {
          options.onClick?.();
          notification.close();
        };
      }

      // 自动关闭非错误通知
      if (options.tag !== 'error') {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    } catch (error) {
      console.error('发送通知失败:', error);
      console.log('通知:', options.title, '-', options.body);
    }
  }

  // 获取通知图标
  private getIcon(type: 'success' | 'error' | 'warning' | 'info'): string {
    // 这里可以返回实际图标 URL，暂时返回空字符串
    return '';
  }

  // 请求权限并显示友好提示
  async ensurePermission(): Promise<boolean> {
    if (this.isSupported && this.permission === 'default') {
      const granted = await this.requestPermission();
      if (granted) {
        this.showInfo('通知已启用', '您将收到安装完成和失败的通知');
      } else {
        this.showInfo('通知未启用', '您可以在浏览器设置中手动启用通知');
      }
      return granted;
    }
    return this.hasPermission();
  }
}

// 创建单例实例
export const notificationService = new NotificationService();

// 便捷的通知方法
export const showNotification = {
  success: (title: string, message: string, options?: Partial<NotificationOptions>) => {
    notificationService.showSuccess(title, message, options);
  },
  error: (title: string, message: string, options?: Partial<NotificationOptions>) => {
    notificationService.showError(title, message, options);
  },
  warning: (title: string, message: string, options?: Partial<NotificationOptions>) => {
    notificationService.showWarning(title, message, options);
  },
  info: (title: string, message: string, options?: Partial<NotificationOptions>) => {
    notificationService.showInfo(title, message, options);
  }
};
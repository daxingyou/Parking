//
//  AppDelegate+Push.m
//  Parking
//
//  Created by gaoshilei on 2018/6/11.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "AppDelegate+Push.h"
#import <CloudPushSDK/CloudPushSDK.h>
#import <UserNotifications/UserNotifications.h>
#import "DataUtils.h"

#define AliPushSDK_Key @"24910042"
#define AliPushSDK_Secret @"0890f4b6b36ade713fc2d93caea7e198"

@implementation AppDelegate (Push)

- (void)setUpPushSDK {
  [[UIApplication sharedApplication] setApplicationIconBadgeNumber:0];
  [CloudPushSDK asyncInit:AliPushSDK_Key appSecret:AliPushSDK_Secret callback:^(CloudPushCallbackResult *res) {
    if (res.success) {
      NSLog(@"Push SDK init success, deviceId: %@.", [CloudPushSDK getDeviceId]);
    } else {
      NSLog(@"Push SDK init failed, error: %@", res.error);
    }
  }];
  [CloudPushSDK sendNotificationAck:nil];
  [self registerRemoteNotification];
}

/*
 *  苹果推送注册成功回调，将苹果返回的deviceToken上传到CloudPush服务器
 */
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [CloudPushSDK registerDevice:deviceToken withCallback:^(CloudPushCallbackResult *res) {
    if (res.success) {
      NSLog(@"Register deviceToken success.");
    } else {
      NSLog(@"Register deviceToken failed, error: %@", res.error);
    }
  }];
}

/*
 *  苹果推送注册失败回调
 */
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  NSLog(@"didFailToRegisterForRemoteNotificationsWithError %@", error);
}

/**
 * 注册推送消息到来监听
 */
- (void)registerMessageReceive {
  [[NSNotificationCenter defaultCenter] addObserver:self  selector:@selector(onMessageReceived:) name:@"CCPDidReceiveMessageNotification" object:nil];
}

/**
 * 处理到来推送消息
 *
 * @param notification
 */
- (void)onMessageReceived:(NSNotification *)notification {
  CCPSysMessage *message = [notification object];
  NSString *title = [[NSString alloc] initWithData:message.title encoding:NSUTF8StringEncoding];
  NSString *body = [[NSString alloc] initWithData:message.body encoding:NSUTF8StringEncoding];
  NSLog(@"Receive message title: %@, content: %@.", title, body);
}

/*
 * App处于启动状态时，通知打开回调
 */
- (void)application:(UIApplication*)application didReceiveRemoteNotification:(NSDictionary*)userInfo {
  NSLog(@"Receive one notification.");
  // 取得APNS通知内容
  NSDictionary *aps = [userInfo valueForKey:@"aps"];
  // 内容
  NSString *content = [aps valueForKey:@"alert"];
  // badge数量
  NSInteger badge = [[aps valueForKey:@"badge"] integerValue];
  // 播放声音
  NSString *sound = [aps valueForKey:@"sound"];
  // 取得Extras字段内容
  NSString *Extras = [userInfo valueForKey:@"Extras"]; //服务端中Extras字段，key是自己定义的
  NSLog(@"content = [%@], badge = [%ld], sound = [%@], Extras = [%@]", content, (long)badge, sound, Extras);
  // iOS badge 清0
  dispatch_async(dispatch_get_main_queue(), ^{
    application.applicationIconBadgeNumber = 0;
  });
  // 通知打开回执上报
  [CloudPushSDK sendNotificationAck:userInfo];
}

/** 注册远程通知 */
- (void)registerRemoteNotification {
  
  
  if ([[UIDevice currentDevice].systemVersion floatValue] >= 10.0) {
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0 // Xcode 8编译会调用
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    [center requestAuthorizationWithOptions:(UNAuthorizationOptionBadge | UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionCarPlay) completionHandler:^(BOOL granted, NSError *_Nullable error) {
      if (!error) {
        NSLog(@"request authorization succeeded!");
      }
    }];
    
    [[UIApplication sharedApplication] registerForRemoteNotifications];
#else // Xcode 7编译会调用
    UIUserNotificationType types = (UIUserNotificationTypeAlert | UIUserNotificationTypeSound | UIUserNotificationTypeBadge);
    UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:types categories:nil];
    [[UIApplication sharedApplication] registerUserNotificationSettings:settings];
    [[UIApplication sharedApplication] registerForRemoteNotifications];
#endif
  } else if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 8.0) {
    UIUserNotificationType types = (UIUserNotificationTypeAlert | UIUserNotificationTypeSound | UIUserNotificationTypeBadge);
    UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:types categories:nil];
    [[UIApplication sharedApplication] registerUserNotificationSettings:settings];
    [[UIApplication sharedApplication] registerForRemoteNotifications];
  }
}

+ (void)isOpenApns:(void(^)(BOOL))callback {
  
  if ([[UIDevice currentDevice].systemVersion floatValue] >= 10.0) {
    
    [[UNUserNotificationCenter currentNotificationCenter] getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings * _Nonnull settings) {
      
      if (settings.authorizationStatus == UNAuthorizationStatusNotDetermined || settings.authorizationStatus == UNAuthorizationStatusDenied) {
        callback(NO);
      }  else if (settings.authorizationStatus == UNAuthorizationStatusAuthorized){
        callback(YES);
      }
    }];
    
  } else if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 8.0) {
    
    if ([[UIApplication sharedApplication] currentUserNotificationSettings].types  == UIUserNotificationTypeNone) {
      callback(NO);
    } else {
      callback(YES);
    }
  } else {
    
    callback(NO);
  }
}

@end

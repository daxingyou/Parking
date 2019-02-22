//
//  ParkingEventManager.m
//  Parking
//
//  Created by gaoshilei on 2018/6/12.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "ParkingEventManager.h"
#import <React/RCTConvert.h>
#import <CloudPushSDK/CloudPushSDK.h>
#import "DataUtils.h"
#import "PayModelFactory.h"
#import "DeviceInfo.h"
#import "WSDatePickerView.h"

#define COLORFor16(hexValue,a)  [UIColor colorWithRed:((float)((hexValue & 0xFF0000) >> 16))/255.0 \
green:((float)((hexValue & 0xFF00) >> 8))/255.0 \
blue:((float)(hexValue & 0xFF))/255.0 alpha:a];

@implementation ParkingEventManager

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(getDevicePushClientId:(RCTResponseSenderBlock)callback)
{
  NSString *clientId = [CloudPushSDK getDeviceId];
  if(isNotEmptyString(clientId)) {
      callback(@[[NSNull null],clientId]);
  }
}

RCT_EXPORT_METHOD(sendPayRequest:(NSDictionary *)payOptions) {
  NSString *url              = payOptions[@"url"];
  EPayType payType           = [payOptions[@"payType"] integerValue];
  
  dispatch_async(dispatch_get_main_queue(), ^{
    BasePayManager *payManager = [PayModelFactory payModelFactoryWqWithPayType:payType];
    [payManager sendPayWithUrl:url payCallback:^(EPayCallbackType callbackType, NSString *out_trade_no) {
      
    }];
  });
}

RCT_EXPORT_METHOD(getAppVersion:(RCTResponseSenderBlock)callback)
{
  NSString *version = [DeviceInfo appVersion];
  if(isNotEmptyString(version)) {
    callback(@[[NSNull null],version]);
  }
}

RCT_EXPORT_METHOD(selectDateTime:(RCTResponseSenderBlock)callback)
{
    dispatch_async(dispatch_get_main_queue(), ^{
      //月-日-时-分 
      WSDatePickerView *datepicker = [[WSDatePickerView alloc] initWithDateStyle:DateStyleShowMonthDayHourMinute CompleteBlock:^(NSDate *selectDate) {
        double ts = [selectDate timeIntervalSince1970]*1000;
        NSString *dateString = [NSString stringWithFormat:@"%.0f",ts];
        NSLog(@"%@",dateString);
        callback(@[[NSNull null],dateString]);
      }];
      datepicker.minLimitDate = [NSDate date];
      datepicker.dateLabelColor = COLORFor16(0xEF5B30, 1)//年-月-日-时-分 颜色
      datepicker.datePickerColor = [UIColor blackColor];//滚轮日期颜色
      datepicker.doneButtonColor = COLORFor16(0xEF5B30, 1)//确定按钮的颜色
      [datepicker show];
    });
}

@end

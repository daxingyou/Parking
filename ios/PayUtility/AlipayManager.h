//
//  AlipayManager.h
//  LittleBee
//
//  Created by diaolong on 15/9/24.
//
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <AlipaySDK/AlipaySDK.h>
#import "PayResultProcess.h"
#import "BasePayManager.h"


@interface AlipayManager : BasePayManager

+ (AlipayManager *)sharedManager;
- (void)processAlipayResult:(NSDictionary *)resultDic;

@end

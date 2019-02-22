package com.ilinkin.parking;

import android.app.Application;
import android.content.Context;
import android.util.Log;
import com.alibaba.sdk.android.push.CloudPushService;
import com.alibaba.sdk.android.push.CommonCallback;
import com.alibaba.sdk.android.push.noonesdk.PushServiceFactory;

import com.facebook.react.ReactApplication;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import com.ilinkin.parking.communication.CommPackage;

import java.util.Arrays;
import java.util.List;

import com.imagepicker.ImagePickerPackage;

public class MainApplication extends Application implements ReactApplication {

  private static final String TAG = "Init";
  private static final CommPackage mCommPackage = new CommPackage();

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
              new MainReactPackage(),
              new ImagePickerPackage(), // <-- add this line
              new RNDeviceInfo(),
              mCommPackage
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    /** 初始化云推送通道*/
    initCloudChannel(this);
    SoLoader.init(this, /* native exopackage */ false);
  }

  /**
   * 初始化云推送通道
   * @param applicationContext
   */
  private void initCloudChannel(Context applicationContext) {
    PushServiceFactory.init(applicationContext);
    CloudPushService pushService = PushServiceFactory.getCloudPushService();
    pushService.register(applicationContext, new CommonCallback() {
      @Override
      public void onSuccess(String response) {
        Log.d(TAG, "init cloudchannel success");
      }
      @Override
      public void onFailed(String errorCode, String errorMessage) {
        Log.d(TAG, "init cloudchannel failed -- errorcode:" + errorCode + " -- errorMessage:" + errorMessage);
      }
    });
  }


}

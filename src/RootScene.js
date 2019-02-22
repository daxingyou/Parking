import React, {
    PureComponent,
} from 'react'
import {StatusBar,Image} from 'react-native'
import {
    StackNavigator, 
    TabNavigator, 
    TabBarBottom,
} from 'react-navigation'

import TabBarItem from './widget/tabBarItem'

import HomePaymentScene from './scene/Home/HomePaymentScene'
import HomeScene from './scene/Home/ParkingHomeScene'
import ParkingInfoScene from './scene/Home/ParkingInfoScene'
import MessageScene from './scene/Message/ParkingMessageScene'
import ProfileScene from './scene/Profile/ParkingProfileScene'
import MyCarScene from './scene/Profile/MyCarScene'
import MyBookingScene from './scene/Profile/MyBookingScene'
import MyPaymentScene from './scene/Profile/MyPaymentScene'
import PaymentActionScene from './scene/Home/PaymentActionScene'
import LoginScene from './scene/Profile/LoginScene'
import AddNewCarScene from './scene/Profile/AddNewCarScene'
import AppInfoScene from './scene/Profile/AppInfoScene'
import MyBookingDetailScene from './scene/Profile/MyBookingDetailScene'

import color from './widget/color'

const lightContentScenes = ['Profile']

function getCurrentRouteName(navigationState: any) {
    if (!navigationState) {
        return null
    }
    const route = navigationState.routes[navigationState.index]
    // dive into nested navigators
    if (route.routes) {
        return getCurrentRouteName(route)
    }
    return route.routeName
}

const TabRouteConfigs = {
    Home: {
        screen: HomeScene,
        navigationOptions: ({navigation}) => ({
            headerTitleStyle:{
                flex: 1,
                color:'black',
                fontSize:18,
                textAlign:'center'        
            },
            tabBarLabel: '首页',
            tabBarIcon: ({focused,tintColor})=>(
                <TabBarItem
                    tintColor={tintColor}
                    focused={focused}
                    normalImage={require('./img/tabbar/tabbar_homepage_1.png')}
                    selectedImage={require('./img/tabbar/tabbar_homepage_selected_1.png')}
                />
            )
        }),
    },
    Message: {
        screen: MessageScene,
        navigationOptions: ({navigation}) => ({
            headerTitleStyle:{
                flex: 1,
                color:'black',
                fontSize:18,
                textAlign:'center'        
            },
            tabBarLabel: '消息',
            tabBarIcon: ({focused, tintColor}) => (
                <TabBarItem
                    tintColor={tintColor}
                    focused={focused}
                    normalImage={require('./img/tabbar/tabbar_messagepage_1.png')}
                    selectedImage={require('./img/tabbar/tabbar_messagepage_selected_1.png')}
                />
            )
        }),
    },
    Profile: {
        screen: ProfileScene,
        navigationOptions: ({navigation}) => ({
            headerTitleStyle:{
                flex: 1,
                color:'black',
                fontSize:18,
                textAlign:'center'        
            },
            tabBarLabel: '我的',
            tabBarIcon: ({focused, tintColor}) => (
                <TabBarItem
                    tintColor={tintColor}
                    focused={focused}
                    normalImage={require('./img/tabbar/tabbar_mine_1.png')}
                    selectedImage={require('./img/tabbar/tabbar_mine_selected_1.png')}
                />
            )
        }),
    }
}

const TabNavigatorConfigs = { 
    initialRouteName: 'Home',
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    lazy: true,
    animationEnabled: true,
    swipeEnabled: true,
    tabBarOptions: {
        activeTintColor: color.primary,
        inactiveTintColor: color.gray,
        style: {backgroundColor: '#ffffff'},
        showLabel:true,
        showIcon: true, // android 默认不显示 icon, 需要设置为 true 才会显示
        indicatorStyle: {
            height: 0
        },
    },
}

/** 底部tabbar */
const Tab = TabNavigator(TabRouteConfigs, TabNavigatorConfigs)

/** 顶部导航栏配置 */
const Navigator = StackNavigator(
    {
        Tab: {screen: Tab},
        MyCar: {screen: MyCarScene},
        MyBooking: {screen: MyBookingScene},
        MyPayment: {screen: MyPaymentScene},
        ParkingInfoScene: {screen: ParkingInfoScene},
        PaymentActionScene: {screen: PaymentActionScene},
        LoginScene: {screen: LoginScene},
        AddNewCarScene: {screen: AddNewCarScene},
        AppInfoScene: {screen: AppInfoScene},
        MyBookingDetailScene: {screen: MyBookingDetailScene},
    },
    {
        navigationOptions: {
            // headerStyle: { backgroundColor: color.primary }
            headerBackTitle: null,
            headerTintColor: '#333333',
            showIcon: true,
            headerTitleStyle:{
                flex: 1,
                color:'black',
                fontSize:18,
                textAlign:'center'        
            },
        },
    }
)

export default class RootScene extends PureComponent<{}> {

    constructor() {
        super()
        StatusBar.setBarStyle('dark-content')
    }

    render() {
        return (
            <Navigator
                onNavigationStateChange={
                    (prevState, currentState) => {
                        const currentScene = getCurrentRouteName(currentState)
                        const previousScene = getCurrentRouteName(prevState)
                        if (previousScene !== currentScene) {
                            if (lightContentScenes.indexOf(currentScene) >= 0) {
                                StatusBar.setBarStyle('light-content')
                            } else {
                                StatusBar.setBarStyle('dark-content')
                            }
                        }
                    }
                }
            />
        )
    }        
}
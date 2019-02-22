import React, {PureComponent} from 'react'
import { NativeModules } from 'react-native'

import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    StatusBar,
    Platform,
    Linking,
    Alert
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view'
import DeviceInfo from 'react-native-device-info'

import HomeBookingScene from './HomeBookingScene'
import HomePaymentScene from './HomePaymentScene'

import color from '../../widget/color'
import {screen,system} from '../../common'
import api,{paramsFormatGET} from '../../common/api'
import Toast from '../../component/Toast'
import { storage } from '../../common/storage'

type Props = {
    navigation : any,
}

export default class HomeScene extends PureComponent<Props, State> {
    /** 导航栏配置 */
    static navigationOptions = ({navigation}: any) => ({
        title: '首页',
        headerStyle: {backgroundColor: 'white'},
    })

    constructor(props: Props) {
        super(props);
        this.state = {
            dataList: [],
            refreshing: false,
        }
    }

    componentDidMount = () => {
        this.checkUpdate()
        setTimeout(() => {
            this.getDevicePushID()
        }, 5000);
    }

    getDevicePushID = async () => {
        let ParkingEventManager = NativeModules.ParkingEventManager
        ParkingEventManager.getDevicePushClientId((error, events) => {
            if (error) {
                console.error(error);
            } else {
                this.updateUserInfoForPushId(events)
                console.log('获取推送的设备id为：' + JSON.stringify(events));
            }
        })
    }

    checkUpdate = async () => {
        try {
            let platform = system.isIOS?'IOS':'ANDROID';
            let params = {
                platform: platform,
            }
            console.log('升级接口:'+ paramsFormatGET(api.APP_UPDATE_API,params))
           let response = await fetch(paramsFormatGET(api.APP_UPDATE_API,params),{
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            let data = await response.json()
            console.log('升级接口:'+ paramsFormatGET(api.APP_UPDATE_API,params) + ':'+ JSON.stringify(data));
            switch (response.status) {
                case 200:
                {
                    let downloadUrl = data.download_url;
                    let new_version = data.new_version;
                    console.log('本地版本：'+ DeviceInfo.getVersion() + '=====最新版本：' + new_version)
                    if (new_version!=DeviceInfo.getVersion()) {
                        if (downloadUrl) {
                            Alert.alert('版本升级',('检测到新版本，是否升级？'), [
                                {text:"否",},
                                {text:"是", onPress:() => {
                                    Linking.openURL(downloadUrl)
                                }},
                            ])
                        }
                    }
                }
                    break;
                case 403:
                {
                    Toast.show('未登录')
                }
                    break;
                default: 
                {
                    Toast.show('未知系统错误')
                }
                    break;
            }
        } catch (error) {
            console.log(error)
        }
    }


    updateUserInfoForPushId = async (deviceId) => {
        try {
            let params = {
                phone_type: 1,
                cid: deviceId,
            }
            console.log(JSON.stringify(params))
            let response = await fetch(api.GET_UPDATE_USER_INFO_API,{
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            })
            let res = await response.json()
            console.log('GET_USER_INFO_API:'+ api.GET_UPDATE_USER_INFO_API + ':'+ JSON.stringify(res));
        } catch (error) {
            console.log(error)
        }
    }

    render() {
        let switchTitles = ['预约','缴费']
        let types = ['预约','缴费']
        return (
            <ScrollableTabView 
                style={styles.container}
                tabBarBackgroundColor='white'
                tabBarActiveTextColor='#EF5B30'
                tabBarInactiveTextColor='#555555'
                tabBarTextStyle={styles.tabBarText}
                tabBarUnderlineStyle={styles.tabBarUnderline} 
            >
                <HomeBookingScene
                    tabLabel={switchTitles[0]}
                    key={0}
                    types={types[0]}
                    navigation={(this.props.navigation)}
                ></HomeBookingScene>
                <HomePaymentScene
                    tabLabel={switchTitles[1]}
                    key={1}
                    types={types[1]}
                    navigation={(this.props.navigation)}
                ></HomePaymentScene>
            </ScrollableTabView>
        )
    }
}

const styles = StyleSheet.create ({
    container: {
        flex: 1,
        backgroundColor: color.paper,
    },
    tabBarText: {
        fontSize: 14,
        marginTop: 13,
    },
    tabBarUnderline: {
        backgroundColor: color.primary
    },
    navTitle: {
        width: screen.width * 0.7,
        height: 30,
        borderRadius: 19,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'red',
        alignSelf: 'center',
    },
})



import React, {PureComponent} from 'react'
import {
    View, 
    Text, 
    TextInput,
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    ListView, 
    Image, 
    StatusBar,
    Button,
    Alert,
    NativeModules,
    DeviceEventEmitter
} from 'react-native'
import CountDownButton from 'react-native-smscode-count-down'

import { color } from '../../widget'
import { screen } from '../../common'
import { Title, Paragraph, Tip } from '../../widget/customText'
import PKButton from '../../widget/button'
import api from '../../common/api'
import Toast from '../../component/Toast'
import { storage } from '../../common/storage'

type Props = {
    navigation: any,
}

type State = {
    Info: Object,
}

export default  class LoginScene extends PureComponent<Props, State> {
    /** 导航栏配置 */
    static navigationOptions = ({navigation}:any) => ({
        title: '登录',
        headerStyle: {backgroundColor: 'white'},
        headerTitleStyle:{
            color:'black',
            fontSize: 16
        },
    })

    constructor(props: Props) {
        super(props)
        this.state = {
            account: ''
        }
    }

    componentDidMount = () => {
        
    }

    getCaptchaPressed =  async (shouldStartCounting) => {
        if (!this.state.account) {
            Toast.show('请输入手机号码')
            return;
        }
        shouldStartCounting && shouldStartCounting(true)
        try {
            let params = {
                phone_number: this.state.account,
            }
            console.log(JSON.stringify(params))
            let response = await fetch(api.GET_CAPTCHA_API,{
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
                })
            let json = await response.json()
            console.log('GET_CAPTCHA_API' + JSON.stringify(response))
            switch (response.status) {
                case 200:
                    {
                        Toast.show('验证码已发送')
                    }
                    break;
                case 400:
                    {
                        Toast.show('手机号码错误')
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

    loginButtonPressed = async () => {
        if (!this.state.account) {
            Toast.show('请输入手机号码')
            return
        }
        if (!this.state.captcha) {
            Toast.show('请输入验证码')
            return
        }
        try {
            let params = {
                phone_number: this.state.account,
                phone_verify_code: this.state.captcha,
            }
            console.log('登录参数' + JSON.stringify(params))
            let response = await fetch(api.LOGIN_API,{
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            })
            let json = await response.json()
            switch (response.status) {
                case 200:
                {
                    Toast.show('登录成功')
                    // 存
                    console.log('LOGIN_API' + JSON.stringify(json))
                    storage.save('loginInfo', json)
                    //登录成功后通知其他页面刷新数据
                    DeviceEventEmitter.emit('LOGIN_NOTIFICATION')
                    //登录成功之后上传推送的deviceId
                    this.getDevicePushID()
                    setTimeout(() => {
                        this.props.navigation.goBack()
                    }, 1300);
                }
                    break;
                case 400:
                {
                    Toast.show('手机号或验证码错误')
                }
                    break;
                case 403:
                {
                    Toast.show('验证码错误')
                }
                    break;
                case 419:
                {
                    Toast.show('验证码超时')
                }
                    break;
                case 429:
                {
                    Toast.show('请求过于频繁，请稍后再试')
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
    

    render = () => {
        return(
            <View style={styles.container}>

                <View style={styles.title}>
                    <Text style={{fontSize: 20}}>白银社区智慧停车场系统</Text>
                </View>

                <View style={styles.content}>
                    <TextInput 
                        placeholder='请输入手机号'
                        maxLength={(11)}
                        placeholderTextColor={color.gray}
                        value={this.state.account}
                        onChangeText={(text) => this.setState({account:text})}
                        style={styles.PhoneInput}
                        underlineColorAndroid='transparent'
                    />
                    <View style={styles.captchaRow}>
                        <TextInput 
                            placeholder='请输入短信验证码'
                            maxLength={(11)}
                            placeholderTextColor={color.gray}
                            onChangeText={(text) => this.setState({captcha:text})}
                            value={this.state.captcha}
                            underlineColorAndroid='transparent'
                            style={{width: 120}}
                        />
                        <View style={styles.captchaButton}>
                            <CountDownButton
                                textStyle={{color: '#fff',fontSize: 13,}}
                                timerCount={60}
                                timerTitle={'获取验证码'}
                                enable={this.state.account.length > 10}
                                onClick={(shouldStartCounting)=>{
                                    this.getCaptchaPressed(shouldStartCounting)
                                }}
                                timerEnd={()=>{
                                    this.setState({
                                        state: '倒计时结束'
                                })}}
                                timerActiveTitle={['', 's']}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.loginButton}>
                    <PKButton
                        onPress={(this.loginButtonPressed)}
                        title='登录'
                        titleStyle={{color: '#fff',fontSize: 16,}}
                    />
                </View>

            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white',
    },
    title: {
        height: 150,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: 25,
    },
    PhoneInput: {
        height: 48,
        borderBottomWidth: screen.onePixel,
        borderColor: color.border,
        paddingRight: 15,
    },
    captchaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 48,
        borderBottomWidth: screen.onePixel,
        borderColor: color.border,
    },
    captchaButton: {
        width: 80,
        height: 30,
        backgroundColor: color.primary,
        marginRight: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButton: {
        width: screen.width - 50,
        height: 44,
        marginTop: 45,
        marginLeft: 25,
        marginBottom: 35,
        backgroundColor: color.primary,
        borderRadius: 5,
        justifyContent: 'center',
    }
})
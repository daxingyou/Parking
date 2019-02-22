
import React, {PureComponent} from 'react'
import {
    View, 
    Text, 
    StyleSheet, 
    StatusBar, 
    Image, 
    TouchableOpacity, 
    ScrollView,
    RefreshControl,
    Button,
    Alert,
    NativeModules,
    DeviceEventEmitter
} from 'react-native'

import ImagePicker from 'react-native-image-picker'

import ProfileCell from './View/ProfileCell'
import { screen, system } from '../../common'
import { color, SpacingView,PKButton } from '../../widget'
import { Title, Paragraph } from '../../widget/customText'
import api from '../../common/api'
import Toast from '../../component/Toast'
import { storage } from '../../common/storage'

type Props = {

}

type State = {
    buttonText?:string,
    profileInfo: Object,
}

export default  class ProfileScene extends PureComponent<Props, State> {
    static navigationOptions = ({navigation}: any) => ({
        title: '',
        headerStyle: {
            backgroundColor: color.primary,
            elevation: 0,
            borderBottomWidth: 0,
        },
        headerTitleStyle:{
            color:color.primary,
            fontSize:0
        },  
    })

    constructor(props: Object) {
        super(props)

        this.state = {
            buttonText : '登录',
            profileInfo: {
                image: '',
                phone_number: '未登录',
            }
        }
    }

    componentDidMount = () => {
        this.loginEmitter = DeviceEventEmitter.addListener('LOGIN_NOTIFICATION',_ => this.requestUserInfo())
        this.requestUserInfo()
        storage.load('loginInfo', (data) => {
            console.log('loginInfo' + data)
            if (!data.notFound) {
                this.setState({buttonText: '退出登录'})
            }
        })
        this.clearLogInfoEmitter = DeviceEventEmitter.addListener('CLEAR_LOGINFO__NOTIFICATION',_ => this.clearLoginInfo())
    };
    
    componentWillUnmount(){
        this.loginEmitter.remove()
        this.clearLogInfoEmitter.remove();
    }

    selectPhotoTapped = () => {
        storage.load('loginInfo', (data) => {
            console.log('loginInfo')
            if (data.notFound) {
                this.props.navigation.navigate('LoginScene')
            }else {
                this.showImagePicker()
            }
        })
    }

    showImagePicker = () => {
        const options = {
            quality: 1.0,
            maxWidth: 500,
            maxHeight: 500,
            storageOptions: {
                skipBackup: true 
            },
            title: '头像选择',
            cancelButtonTitle: '取消',
            takePhotoButtonTitle: '拍摄照片',
            chooseFromLibraryButtonTitle: '从相册中选择'
        }
        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled photo picker');
            }
            else if (response.error) {
                Toast.show(response.error)
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                Toast.show(response.customButton)
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                let source = { uri: response.uri }
                let formData = new FormData()
                let file = {uri: response.uri, type: 'multipart/form-data', name: 'image.png'} //这里的key(uri和type和name)不能改变
                formData.append("image",file);   //这里的files就是后台需要的key
                // You can also display the image using data:
                // let source = { uri: 'data:image/jpeg;base64,' + response.data };
                this.uploadAvatar(formData)
                // this.setState({
                //     avatarSource: source
                // });
            }
        })
    }


    uploadAvatar = async (formData) => {
        try {
            let response = await fetch(api.GET_UPDATE_USER_INFO_API,{
                method: 'PUT',
                headers:{
                    'Content-Type':'multipart/form-data',
                },
                body:formData,
            })
            console.log(response.status)
            let profileInfo = await response.json()
            console.log('上传头像返回:'+ JSON.stringify(profileInfo));
            switch (response.status) {
                case 200:
                    {
                        this.setState(
                            {
                                profileInfo: profileInfo,
                                refreshing: false,
                            }
                        )
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

    clearLoginInfo = () => {
        storage.remove('loginInfo')                       
        this.setState({
            buttonText: '登录',
            profileInfo: {phone_number:'未登录'}
        })
        DeviceEventEmitter.emit('LOGOUT_NOTIFICATION')
    }
    
    requestUserInfo =  async () => {
        try {
            let response = await fetch(api.GET_UPDATE_USER_INFO_API,{
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            console.log(response.status)
            let profileInfo = await response.json()
            console.log('GET_USER_INFO_API:'+ api.GET_UPDATE_USER_INFO_API + ':'+ JSON.stringify(profileInfo));
            switch (response.status) {
                case 200:
                    {
                        this.setState(
                            {
                                profileInfo: profileInfo,
                                buttonText: '退出登录',
                            }
                        )
                    }
                    break;
                case 403:
                    {
                        this.setState(
                            {
                                profileInfo: {},
                                buttonText: '登录',
                            }
                        )
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

    logoutAction = async () => {
        try {
            let response = await fetch(api.LOGOUT_API,{
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            console.log(response.status)
            let json = await response.json()
            switch (response.status) {
                case 200:
                    {
                        //退出登录后通知其他页面刷新数据
                        DeviceEventEmitter.emit('LOGOUT_NOTIFICATION')
                        Toast.show('退出登录成功') 
                        this.clearLoginInfo();
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

    onButtonPress = () => {
        storage.load('loginInfo', (data) => {
            console.log('loginInfo' + data)
            if (data.notFound) {
                this.props.navigation.navigate('LoginScene')
            }else {
                Alert.alert('退出登录',('是否确定退出登录？'), [
                    {text:"取消",},
                    {text:"确定", onPress:this.logoutAction},
                ])
            }
        })
    }

    onCellSelected = (key) => {
        StatusBar.setBarStyle('default', false)
        switch (key) {
            case 0:
                this.props.navigation.navigate('MyCar')
                break;
            case 1:
                this.props.navigation.navigate('MyBooking')
                break;
            case 2:
                this.props.navigation.navigate('MyPayment')
                break;
            case 3:
                this.props.navigation.navigate('AppInfoScene')
                break;
            default:
                break;
        }
    }

    getDataList() {
        return (
            [
                [
                    {key: 'mycar', title: '我的车牌', iconName: 'car'},
                    {key: 'mybooking', title: '我的预约', iconName: 'book'},
                    {key: 'mypay', title: '我的缴费', iconName: 'viacoin'},
                    {key: 'appinfo', title: '关于', iconName: 'question-circle'},
                ]
            ]
        )
    }

    renderCells = () => {
        let cells = []
        let dataList = this.getDataList()
        for (let i = 0; i < dataList.length; i++) {
            let sublist = dataList[i]
            for (let j = 0; j < sublist.length; j++) {
                let data = sublist[j]
                let cell = <ProfileCell 
                            iconName={data.iconName} 
                            title={data.title} 
                            cellId={j}
                            onPress={this.onCellSelected} 
                            key={data.key}
                            />
                cells.push(cell)
            }
            cells.push(<SpacingView key={i} />)
        }

        return (
            cells
        )
    }

    renderHeader = () => {
        return (
            <View style={styles.header}>
                <View>
                    <TouchableOpacity onPress={_ => this.selectPhotoTapped()}>
                    {!!this.state.profileInfo.image?<Image style={styles.profileAvatar} source={{uri: this.state.profileInfo.image}} />:<Image style={styles.profileAvatar} source={require('../../img/defatult_avatar.jpg')} />}
                    </TouchableOpacity>
                    <View style={styles.profileName}>
                        <Paragraph>{this.state.profileInfo.phone_number}</Paragraph>
                    </View>
                </View>
            </View>
        )
    }

    renderButton = () => {
        return (
            <View style={styles.button}>
                <PKButton
                    onPress={this.onButtonPress}
                    title={this.state.buttonText}
                    titleStyle={{color: '#fff',fontSize: 16,}}
                />
            </View>
        )
    }

    render = () => {
        return (
            <View style={{flex: 1, backgroundColor: color.paper}}>
                {this.renderHeader()}
                <SpacingView />
                {this.renderCells()}
                {this.renderButton()}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: color.primary,
        paddingBottom: 20,
        flexDirection: 'column',
        alignItems: 'center',
    },
    profileAvatar: {
        width: 80,
        height: 80,
        marginBottom: 10,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    profileName: {
        alignItems: 'center',
    },
    button: {
        width: screen.width - 100,
        height: 44,
        marginTop: 45,
        marginLeft: 50,
        backgroundColor: color.primary,
        borderRadius: 5,
        justifyContent: 'center',
    }
})
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
    NativeModules
} from 'react-native'

import { color } from '../../widget'
import { screen } from '../../common'
import { Title, Paragraph, Tip } from '../../widget/customText'
import PKButton from '../../widget/button'
import api from '../../common/api'
import Toast from '../../component/Toast'

type Props = {
    navigation: any,
}

type State = {
    Info: Object,
}

export default  class AddNewCarScene extends PureComponent<Props, State> {
    /** 导航栏配置 */
    static navigationOptions = ({navigation}:any) => ({
        title: '新增车牌',
        headerStyle: {backgroundColor: 'white'},
        headerTitleStyle:{
            color:'black',
            fontSize: 16
        },
    })
    constructor(props: Props) {
        super(props)
        this.state = {
            newPlate: null,
        }
    }

    submitAction = async () => {
        if (!this.state.newPlate || this.state.newPlate.length != 7) {
            Toast.show('车牌号长度不正确')
            return;
        }
        var express = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
        result = express.test(this.state.newPlate);
        if (!result) {
            Toast.show('车牌号有误，请检查')
            return;
        }
        try {
            let params = {
                plate: this.state.newPlate,
                remark: '缴费'
            }
            let response = await fetch(api.PLATE_API, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            })
            let dataList = await response.json()
            console.log('ADD_PLATE_API:' + JSON.stringify(dataList));
            switch (response.status) {
                case 201:
                    {
                        Toast.show('车牌添加成功')
                        if (this.props.navigation.state.params.callback) {
                            this.props.navigation.state.params.callback()
                            this.props.navigation.goBack()
                        }
                    }
                    break;
                case 400:
                    {
                        Toast.show('提交数据有误')
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
            this.setState({refreshing: false})
        }
    }

    render = () => {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text>车牌号</Text>
                    <TextInput 
                        placeholder='请输入车牌号'
                        placeholderTextColor={color.gray}
                        value={this.state.account}
                        onChangeText={(text) => this.setState({newPlate:text})}
                        style={styles.plateInput}
                        underlineColorAndroid='transparent'
                    />
                </View>
                <View style={styles.submitButton}>
                    <PKButton
                        onPress={(this.submitAction)}
                        title='确认添加'
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
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        top: 15,
        paddingLeft: 25,
        // borderTopWidth: screen.onePixel,
        borderBottomWidth: screen.onePixel,
        borderColor: color.border,
    },
    plateInput: {
        width: 150,
        height: 44,
        marginLeft: 15,
        paddingRight: 15,
    },
    submitButton: {
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
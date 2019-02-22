import React, {PureComponent} from 'react'
import {
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    ListView, 
    Image, 
    StatusBar,
    Button,
    Alert,
    DeviceEventEmitter
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {color, SpacingView, PKButton } from '../../widget'
import { screen } from '../../common'
import { Title, Paragraph, Tip, Heading2 } from '../../widget/customText'
import api, { paramsFormatGET } from '../../common/api'
import Toast from '../../component/Toast'
import DateUtil from '../../common/dateUtil'

type Props = {
    types: Array<string>,
    navigation: any,
}

type State = {
    Info: Object,
    refreshing: boolean,
    payDescription: string,
    showPayDesc: boolean,
}

export default  class MyBookingDetailScene extends PureComponent<Props, State> {

    /** 导航栏配置 */
    static navigationOptions = ({navigation}:any) => ({
        title: '预约详情',
        headerStyle: {backgroundColor: 'white'},
        headerTitleStyle:{
            color:'black',
            fontSize: 16,
        },
    })

    constructor(props: Props) {
        super(props)
        this.state = {
            Info: this.props.navigation.state.params.info,
            showPayDesc: true,
        }
    }

    componentDidMount = () => {
        this.requestData()
    }

    cancelBookingAction = () => {
        let info = this.props.navigation.state.params.info
        Alert.alert('取消预约',('是否取消' + info.park_name +'的预约？'), [
            {text:"取消",},
            {text:"确定", onPress:this.cancelBookingConfirm},
        ])
    }

    requestData = async () => {
        try {
            /** 获取预约详情用GET */
            let url =  api.ADD_GET_BOOKING_INFO + this.props.navigation.state.params.info.id.toString()  + '/'
            let response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            let data = await response.json()
            console.log('>>INFO:>>' + JSON.stringify(this.props.navigation.state.params.info));
            console.log(url + '>>预约详情:>>' + JSON.stringify(data));
            switch (response.status) {
                case 200:
                    {
                        this.setState({
                            Info: data
                        })
                    }
                    break;
                case 403: {
                    Toast.show('未登录')
                }
                    break;
                case 599: {
                    Toast.show('取消预约失败')
                }
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.log(error)
            this.setState({refreshing: false})
        }
    }

    /** 取消预约操作 */
    cancelBookingConfirm = async () => {
        try {
             /** 取消预约用PUT */
            let url =  api.ADD_GET_BOOKING_INFO + this.state.Info.id.toString()  + '/'
            let response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            let data = await response.json()
            console.log(url + '>>取消预约:>>' + JSON.stringify(data));
            switch (response.status) {
                case 200:
                    {
                        //取消预约，刷新前面的预约列表
                        DeviceEventEmitter.emit('REFRESH_BOOKINGLIST_NOTIFICATION')
                        Toast.show('取消预约成功！')
                        setTimeout(() => {
                            this.props.navigation.goBack()
                        }, 1500);
                    }
                    break;
                case 403: {
                    Toast.show('未登录')
                }
                    break;
                case 599: {
                    Toast.show('取消预约失败')
                }
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.log(error)
            this.setState({refreshing: false})
        }
    }

    showDescription = () => {
        this.setState({showPayDesc:!this.state.showPayDesc})
    }

    render = () => {
        return (
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={true}>

                    <SpacingView/>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoRow}><Title>预约开始时间</Title><Paragraph>{this.state.Info.start_time}</Paragraph></View>
                        <View style={styles.infoRow}><Title>预约保留时间</Title><Paragraph>{this.state.Info.end_time}</Paragraph></View>
                        <View style={styles.infoRow}><Title>停车场</Title><Paragraph>{this.state.Info.park_name}</Paragraph></View>
                        <View style={styles.infoRow}><Title>车牌号</Title><Paragraph>{this.state.Info.plate_str}</Paragraph></View>
                        <View style={styles.infoRow}><Title>预约状态</Title><Paragraph>{this.state.Info.status_str}</Paragraph></View>
                    </View>

                    <SpacingView/>
                    
                    <TouchableOpacity onPress={this.showDescription}>
                        <View style={styles.descHeader}>
                            <Title>预约说明</Title>
                            <Icon name={this.state.showPayDesc?'angle-up':'angle-down'} size={25} color={color.primary} />
                        </View>
                    </TouchableOpacity>
                    
                    {this.state.showPayDesc ? 
                    (
                    <View style={styles.descContainer}>
                    <Tip style={{fontSize: 11}}>{this.state.Info.reservation_instruction}</Tip>
                    </View>
                    ):null}

                    <SpacingView/>
                    {(this.state.Info.status==1)?
                    <View style={styles.button}>
                        <PKButton
                            onPress={(this.cancelBookingAction)}
                            title='取消预约'
                            titleStyle={{color: '#fff',fontSize: 16,}}
                        />
                    </View>:null
                    }

                </ScrollView>
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
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderTopWidth: screen.onePixel,
        borderBottomWidth: screen.onePixel,
        borderColor: color.border,
    },
    infoContainer: {
        padding: 15,
        borderTopWidth: screen.onePixel,
        borderBottomWidth: screen.onePixel,
        borderColor: color.border,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 5,
        paddingBottom: 5,
    },
    descHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderTopWidth: screen.onePixel,
        borderBottomWidth: screen.onePixel,
        borderColor: color.border,
    },
    descContainer: {
        padding: 15,
        borderBottomWidth: screen.onePixel,
        borderColor: color.border,
    },
    button: {
        width: screen.width - 100,
        height: 44,
        marginTop: 35,
        marginLeft: 50,
        marginBottom: 35,
        backgroundColor: color.primary,
        borderRadius: 5,
        justifyContent: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 5,
        paddingBottom: 5,
    },
    plateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        borderTopWidth: screen.onePixel,
        borderBottomWidth: screen.onePixel,
        borderColor: color.border,
    },
})

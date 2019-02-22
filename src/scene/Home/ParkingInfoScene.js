import React, {PureComponent} from 'react'
import {
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    ListView, 
    FlatList,
    Image, 
    StatusBar,
    Button,
    Alert,
    DeviceEventEmitter,
    DatePickerAndroid,
    TimePickerAndroid,
    NativeModules,
    Modal
} from 'react-native'
import RefreshListView from 'react-native-refresh-list-view'
import Icon from 'react-native-vector-icons/FontAwesome'
import {color, SpacingView, PKButton } from '../../widget'
import { screen,system } from '../../common'
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

export default  class ParkingInfoScene extends PureComponent<Props, State> {

    /** 导航栏配置 */
    static navigationOptions = ({navigation}:any) => ({
        title: navigation.state.params.info.name,
        headerStyle: {backgroundColor: 'white'},
        headerTitleStyle:{
            color:'black',
            fontSize: 16,
        },
    })

    constructor(props: Props) {
        super(props)
        this.state = {
            showPayDesc: true,
            Info: Object,
            selectedPlate: null,
            dateTime: DateUtil.formatDate(new Date().getTime(), "yyyy-MM-dd hh:mm"),
            timeStamp: new Date().getTime(),
            timeShow: false,
        }
    }

    componentDidMount = () => {
        this.requestData()
        this.getPlateListData()
        this.requestTimeRetention()
    }

    bookingAction = () => {
        if (!this.state.selectedPlate) {
            Toast.show('车牌号不能为空')
            return;
        }
        if (!this.state.retention_time) {
            Toast.show('请选择车位保留时间！');
            return;
        }
        let info = this.props.navigation.state.params.info
        Alert.alert('预约车位',('当前停车场还有'+info.residue_space_count+'个空余车位，是否预约？'), [
            {text:"取消",},
            {text:"确定", onPress:this.bookingConfirm},
        ])
    }

    /** 获取车牌信息 */
    getPlateListData = async () => {
        try {
            let response = await fetch(api.PLATE_API, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            let dataList = await response.json()
            console.log('车牌号列表:' + JSON.stringify(dataList));
            switch (response.status) {
                case 200:
                    {
                        if (dataList.length==1) {
                            this.setState(
                                {
                                    selectedPlate: dataList[0],
                                }
                            )
                        }else {
                            this.setState(
                                {
                                    selectedPlate: null,
                                }
                            )
                        }
                    }
                    break;
                case 403:
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.log(error)
            this.setState({refreshing: false})
        }
    }
    //获取最⼤预约⻋车位保留留时间(分钟)
    requestTimeRetention = async () => {
        try {
            let response = await fetch(api.MAX_RETENTION_TIME,{
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            let data = await response.json()
            console.log('获取最大车位保留时间:' + JSON.stringify(data));
            switch (response.status) {
                case 200:
                {
                    let timeList = [];
                    let max_retention_time = data.max_retention_time;
                    let inter = max_retention_time / 5;
                    for (let index = 1; index <= inter; index++) {
                        const time = index * 5;
                        timeList.push(time);
                    }
                    this.setState({
                        timeList: timeList,
                    });
                }
                    break;
            }
        } catch (error) {
            console.log(error)
        }
    }

    requestData = async () => {
        try {
            let parkingInfoUrl =  api.GET_PARKING_INFO + this.props.navigation.state.params.info.id.toString()  + '/'
            let response = await fetch(parkingInfoUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            let data = await response.json()
            console.log(parkingInfoUrl + '>>停车场详细信息:>>' + JSON.stringify(data));
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
                case 404: {
                    Toast.show('未找到对应的停车场')
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

    /** 预约操作 */
    bookingConfirm = async () => {
        let info = this.props.navigation.state.params.info;
        let params = {
            park: info.id,
            plate: this.state.selectedPlate.id,
            retention_time: this.state.retention_time,
        }
        console.log('预约参数:' +JSON.stringify(params) + '>>this.state' +  JSON.stringify(this.state.timeStamp))
        try {
            let response = await fetch(api.ADD_GET_BOOKING_INFO,{
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            })
            let data = await response.json()
            console.log('预约结果:' + JSON.stringify(data));
            switch (response.status) {
                case 200:
                {
                    DeviceEventEmitter.emit('BOOKING_NOTIFICATION')
                    Alert.alert('预约成功!',(''), [
                        {text:"好的", onPress:_ => {
                            this.props.navigation.goBack()
                        }},
                    ])
                }
                    break;
                case 400:
                {
                    if (data.start_time) {
                        Toast.show(data.start_time)
                    }else {
                        Toast.show('提交数据有误')
                    }
                }
                    break;
                case 403:
                {
                    Toast.show('未登录')
                }
                    break;       
                case 498:
                {
                    Toast.show('预约失败，⽆无可预约⻋车位')
                }
                    break;   
                case 499:
                {
                    Toast.show('预约次数超限，⼀⼈一天只能预约同一个停⻋车场两次')
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

    selectPlate = () => {
        this.props.navigation.navigate('MyCar',{callback: ((plateInfo) => { 
            this.setState({selectedPlate: plateInfo})
        })})
    }

    showDescription = () => {
        this.setState({showPayDesc:!this.state.showPayDesc})
    }

    /** 打开时间选择器 */
    selectDateTime = async () => {
        this.setState({
            timeShow: true,
        });
        // if (system.isIOS) {
        //     let ParkingEventManager = NativeModules.ParkingEventManager
        //     ParkingEventManager.selectDateTime((error, ts) => {
        //         if (error) {
        //             console.error(error);
        //         } else {
        //             let dateTime = DateUtil.formatDate(ts, "yyyy-MM-dd hh:mm")
        //             this.setState({
        //                 timeStamp: ts,
        //                 dateTime: dateTime
        //             })
        //         }
        //     })
        // }else {
        //     this.selectDateTimeAndroid()
        // }
    }

    keyExtractor = (item: Object, index: number) => {
        let randomNum = Math.random()*1000000000
        return randomNum.toString()
    }

    selectDateTimeAndroid = async () => {
        try {
            let dateTime = '';
            const {action, year, month, day} = await DatePickerAndroid.open({
                // 要设置默认值为今天的话，使用`new Date()`即可。
                // 下面显示的会是2020年5月25日。月份是从0开始算的。
                date: new Date()
            });
            if (action !== DatePickerAndroid.dismissedAction) {
                // 这里开始可以处理用户选好的年月日三个参数：year, month (0-11), day
                month++;
                dateTime = year + '-' + month + '-' + day;
                console.log('选择的年月日为：' + dateTime)
                try {
                    const {action, hour, minute} = await TimePickerAndroid.open({
                        hour: 0,
                        minute: 0,
                        is24Hour: true, // 会显示为'2 PM'
                    });
                    if (action !== TimePickerAndroid.dismissedAction) {
                        // 这里开始可以处理用户选好的时分两个参数：hour (0-23), minute (0-59)
                        hour = parseInt(hour)<10?('0'+hour):hour;
                        minute = parseInt(minute)<10?('0'+minute):minute;
                        dateTime = dateTime + ' ' + hour + ':' + minute + ':00';
                        let ts = DateUtil.parserDateString(dateTime);
                        this.setState({
                            timeStamp: ts,
                            dateTime: dateTime
                        })
                    }
                } catch ({code, message}) {
                    console.warn('Cannot open time picker', message);
                }
            }
        } catch ({code, message}) {
            console.warn('Cannot open date picker', message);
        }
    }
    renderTimeCell = (info) => {
        console.log(JSON.stringify(info));
        return (
            <TouchableOpacity onPress={() => {
                this.setState({
                    retention_time:info.item,
                    timeShow: false
                    });
            }} style={styles.timeCell_container}>
                    <Paragraph numberOfLines={0} style={{fontSize: 17}}>{info.item+' 分钟'}</Paragraph>
            </TouchableOpacity>
        )
    }

    render = () => {
        return (
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={true}>

                    <SpacingView/>

                    <View style={styles.plateRow}>
                        <Title>车牌</Title>                    
                        <TouchableOpacity onPress={this.selectPlate}>
                            <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                                <Text>{!!this.state.selectedPlate?this.state.selectedPlate.plate:'请选择车牌'}</Text>
                                <Icon name='angle-right' size={25} color={color.primary} style={{marginLeft: 8}} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <SpacingView/>

                    <TouchableOpacity onPress={this.selectDateTime}>
                        <View style={styles.plateRow}>
                            <Title>车位保留时间</Title>     
                            <View style={{flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>  
                            {this.state.retention_time?<Text>{this.state.retention_time + '分钟'}</Text>:null}             
                            <Icon name='angle-right' size={25} color={color.primary} style={{marginLeft: 8}} />
                            </View>
                        </View>
                    </TouchableOpacity>

                    <SpacingView/>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoRow}><Title>总车位</Title><Paragraph>{this.state.Info.park_space_total+'个'}</Paragraph></View>
                        <View style={styles.infoRow}><Title>空余车位</Title><Paragraph>{this.state.Info.residue_space_count+'个'}</Paragraph></View>
                        <View style={styles.infoRow}><Title>备注</Title><Paragraph>{this.state.Info.remark}</Paragraph></View>
                        <View style={styles.infoRow}><Title>创建时间</Title><Paragraph>{this.state.Info.park_create_time}</Paragraph></View>
                    </View>

                    <SpacingView/>
                    
                    <TouchableOpacity onPress={this.showDescription}>
                        <View style={styles.descHeader}>
                            <Title>缴费说明</Title>
                            <Icon name={this.state.showPayDesc?'angle-up':'angle-down'} size={25} color={color.primary} />
                        </View>
                    </TouchableOpacity>
                    
                    {this.state.showPayDesc ? 
                    (
                    <View style={styles.descContainer}>
                    <Tip style={{fontSize: 11}}>{this.state.Info.payment_instruction}</Tip>
                    </View>
                    ):null}

                    <SpacingView/>

                    <View style={styles.button}>
                        <PKButton
                            onPress={(this.bookingAction)}
                            title='预约'
                            titleStyle={{color: '#fff',fontSize: 16,}}
                        />
                    </View>

                </ScrollView>
                <Modal
                    animationType='fade'
                    transparent={true}
                    visible={this.state.timeShow}
                    onShow={() => {}}
                    onRequestClose={() => {}} 
                >
                    <View style={styles.timeModalContainer}>
                        <View style={styles.actionSheet}>
                            <View style={styles.timeHeader}>
                                <Text style={styles.timeTitle}>选择车位保留时间</Text>
                            </View>
                            <View style={styles.timeBody}>
                                <FlatList
                                    data={(this.state.timeList)}
                                    renderItem={(this.renderTimeCell)}
                                    keyExtractor={this.keyExtractor}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
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
    timeModalContainer: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        width: screen.width,
        height: screen.height,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 4,
    },
    actionSheet: {
        backgroundColor: 'white',
        width: screen.width,
    },
    timeHeader: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    timeTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4A4A4A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeBody: {
        height: 280,
        width: screen.width,
    },
    timeCell_container: {
        flexDirection: 'row',
        padding: 15,
        borderBottomWidth: screen.onePixel,
        borderColor: '#DCDCDC',
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems:'center',
    },
})

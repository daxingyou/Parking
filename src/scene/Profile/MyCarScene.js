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
    FlatList,
    Alert,
    TouchableHighlight
    } from 'react-native'
import RefreshListView, {RefreshState} from 'react-native-refresh-list-view'
import CarCell from './View/CarCell'
import { NavigationItem } from '../../widget' 
import api, { paramsFormatGET } from '../../common/api'
import Toast from '../../component/Toast'
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view'
import {color, SpacingView, PKButton } from '../../widget'
import { storage } from '../../common/storage'

type Props = {
    types: Array<string>,
    navigation: any,
}

type State = {
    dataList: Array<Object>,
    refreshing: boolean,
}

export default class MyCarScene extends PureComponent<Props, State> {
    /** 导航栏配置 */
    static navigationOptions = ({navigation}:any) => ({
        title: '我的车牌',
        headerStyle: {backgroundColor: 'white'},
        headerTitleStyle:{
            color:'black',
            fontSize:16
        },    
        headerRight: (
            <NavigationItem
                title='添加车牌'
                onPress={navigation.state.params?navigation.state.params.navigateRightPress:null}
            />
        ),
    })

    constructor(props: Props) {
        super(props);
        this.state = {
            dataList: [],
            refreshState: false,
        }
    }

    componentDidMount = () => {
        this.props.navigation.setParams({
            navigateRightPress:this.addNewPlate
        })
        this.requestData()
        storage.load('userInfo', (data) => {
            console.log(data)
        })
    }

    addNewPlate = async () => {
        this.props.navigation.navigate('AddNewCarScene',{callback: (() => { 
            console.log('callback：车牌新增')
            this.requestData()
        })})
    }

    didSelected = (info: Object) => {
        if (this.props.navigation.state.params.callback) {
            console.log('选择车牌' + JSON.stringify(info))
            this.props.navigation.state.params.callback(info)
            this.props.navigation.goBack()
        }
    }

    requestData =  async () => {
        this.setState({refreshing: true})
        try {
            let response = await fetch(api.PLATE_API, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            let dataList = await response.json()
            console.log('PLATE_API:' + JSON.stringify(dataList));
            switch (response.status) {
                case 200:
                    {
                        this.setState(
                            {
                                dataList: dataList,
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
            this.setState({refreshing: false})
        }
    }

    plateCanSelected = () => {
        return (this.props.navigation.state.params && this.props.navigation.state.params.callback)
    }

    renderCell = (info) => {
        return (
            <CarCell
                info = {info.item}
                onPress={(this.didSelected)}
                canSelected={this.plateCanSelected()}
            />
        )
    }

	deleteRow = async (rowMap, itemData) => {
        let deleteUrl =  api.PLATE_API + itemData.id.toString() + '/'
        try {
            let response = await fetch(deleteUrl,{
                method: 'DELETE',
            })
            console.log('DELETE_PLATE_API:' + JSON.stringify(response));
            switch (response.status) {
                case 204:
                {
                    Toast.show('删除成功')
                    this.requestData()     
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

    keyExtractor = (item: Object, index: number) => {
        return item.id.toString()
    }

    render = () => {
        if (this.plateCanSelected()) {
            return (
                <View style={styles.container}>
                    <FlatList
                        data={this.state.dataList}
                        renderItem={this.renderCell}
                        refreshing={this.state.refreshing}
                        keyExtractor={this.keyExtractor}
                    />
                </View>   
            )
        }else {
            return (
                <View style={styles.container}>
                    <SwipeListView
                        useFlatList
                        data={this.state.dataList}
                        renderItem={this.renderCell}
                        refreshing={this.state.refreshing}
                        keyExtractor={this.keyExtractor}
                        renderHiddenItem={ (data, rowMap) => (
                            <View style={styles.rowBack}>
                                <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={ _ => this.deleteRow(rowMap, data.item) }>
                                    <Text style={{color: '#fff'}}>删除</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        disableRightSwipe={true}
						rightOpenValue={-75}
						previewRowKey={'0'}
						previewOpenValue={-40}
						previewOpenDelay={3000}
						// onRowDidOpen={this.onRowDidOpen}
                    />
                </View>   
            )
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    rowBack: {
		alignItems: 'center',
		backgroundColor: color.paper,
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingLeft: 15,
	},
    backRightBtn: {
		alignItems: 'center',
		bottom: 0,
		justifyContent: 'center',
		position: 'absolute',
		top: 0,
		width: 75,
	},
    backRightBtnRight: {
		backgroundColor: 'red',
		right: 0
	},
})
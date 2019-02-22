import React, {PureComponent} from 'react'
import {
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {screen} from '../../../common'
import color from '../../../widget/color'
import {Title, Paragraph} from '../../../widget/customText'

type Props = {
    info: Object,
    onPress: Function,
}

export default class PaymentRecordCell extends PureComponent<Props> {
    render() {
        let info = this.props.info
        let createTime = (info.paymentType==1)?info.car_in_time:info.create_time
        return (
            <View>
            <TouchableOpacity onPress={_ => {
                if(info.total_amount&&info.total_amount>0) {
                    this.props.onPress(info)
                }
            }} style={styles.container} >
            <View style={styles.leftContainer}>
                <Title numberOfLines={1}>{info.plate_str}</Title>
                <Title style={{marginTop:5}}>{info.park_name}</Title>
            </View>
            <View style={styles.rightContainer}> 
                <Text style={styles.price}>{'￥'+info.total_amount}</Text>
                {this.renderPayTitle()}
            </View>
            </TouchableOpacity>
            </View>
        )
    }

    renderPayTitle = () => {
        let info = this.props.info
        if (info.paymentType==2) {
            return <Text style={{marginTop:5,color:'gray'}}>已缴费</Text>
        }
        if (info.paymentType==1) {
            if (parseInt(info.total_amount)>0){
                return <Text style={{marginTop:5,color:'red'}}>待支付</Text>;
            }else {
                return <Text style={{marginTop:5,color:'gray'}}>无需支付</Text>;
            }
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: screen.onePixel,
        borderColor: color.border,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    leftContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    rightContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    price: {
        alignItems: 'flex-end',
        color: color.gray,
        fontWeight:'bold',
    }
})
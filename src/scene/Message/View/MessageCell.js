import React, {PureComponent} from 'react'
import {
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {screen} from '../../../common'
import color from '../../../widget/color'
import {Title,Heading2, Paragraph} from '../../../widget/customText'

type Props = {
    info: Object,
    onPress: Function,
}

export default class PaymentRecordCell extends PureComponent<Props> {
    render() {
        let info = this.props.info
        let notiType = ''
        switch (info.notify_type) {
            case 1: {notiType='进停车场'} break;
            case 2: {notiType='出停车场'} break;
            case 3: {notiType='缴费成功'} break;
            case 4: {notiType='预约成功'} break;
            case 5: {notiType='预约超时失效'} break;
            case 6: {notiType='预约取消'} break;
            default:break;
        }
        return (
            <TouchableOpacity style={styles.container} onPress={() => {
                if (info.notify_type==2) {
                    // this.props.onPress(info)
                }
            }}>
                <View style={styles.leftContainer}>
                    <Heading2 numberOfLines={1}>{notiType}</Heading2>
                    <Paragraph style={{marginTop: 5}}>{info.park_name}</Paragraph>
                </View>
                <View style={styles.rightContainer}>
                    <Paragraph>{info.plate_str}</Paragraph>
                    <Paragraph style={{marginTop:5}}>{info.create_time}</Paragraph>
                </View>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: screen.onePixel,
        borderColor: color.border,
        backgroundColor: 'white',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    rightContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
})
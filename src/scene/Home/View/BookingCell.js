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
import {Title, Paragraph} from '../../../widget/customText'

type Props = {
    info: Object,
    onPress: Function,
    bookingAction: Function,
    available: boolean,
}

export default class BookingCell extends PureComponent<Props> {
    render() {
        let info = this.props.info
        return (
            <TouchableOpacity onPress={() => this.props.onPress()} style={styles.container}>

                <Title numberOfLines={2} style={{marginLeft: 10}}>{info.name}</Title>
                
                <TouchableOpacity onPress={() => this.props.onPress()} style={styles.rightContainer}>
                    <Paragraph numberOfLines={1} style={{marginTop: 8}}>{info.residue_space_count+'个车位空余'}</Paragraph>
                    <Paragraph style={this.props.available?styles.bookingAvailable:styles.bookingUnavailable}>点击预约</Paragraph>
                </TouchableOpacity>
                <Icon name='angle-right' size={25} color={color.primary} />
            </TouchableOpacity>
        )
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
        alignItems:'center',
    },
    icon: {
        width: 45,
        height: 45,
        borderRadius: 5,
    },
    rightContainer: {
        flex: 1,
        width: 80,
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    bookingAvailable: {
        fontSize: 10,
        color: color.primary,
        marginTop: 5,
    },
    bookingUnavailable: {
        fontSize: 10,
        color: '#999',
        marginTop: 5,
    }
})

import React, { PureComponent } from 'react';
import { AppRegistry } from 'react-native';
import RootScene from './src/RootScene';
import { YellowBox } from 'react-native'

YellowBox.ignoreWarnings(['Warning:','Module RCTImageLoader requires main queue'])

export default class Parking extends PureComponent<{}> {
    render() {
        return (
            <RootScene />
        );
    }
}

AppRegistry.registerComponent('Parking', () => Parking);


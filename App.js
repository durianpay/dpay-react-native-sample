/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
// import RNDpaySdk from 'react-native-dpay-sdk';
// import onPress from 'react-native-dpay-sdk';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  NativeEventEmitter,
  NativeModules,
  Alert,
  Platform
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {Component} from 'react/cjs/react.production.min';

const { CalendarManager } = NativeModules;
// const { RNDpaySdk } = NativeModules;
const { RNDpaySDK, ReactNativeEventEmitter } = NativeModules;

var dpayEvent = null;

const Section = ({children, title}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App = () => {
  // componentDidMount() {
  //   dpayEvent = new NativeEventEmitter(NativeModules.RNDpaySDK);
  //   dpayEvent.addListener('DpaySuccess', this.success);
  // }
  // componentWillUnmount() {
  //   if (dpayEvent) {
  //     dpayEvent.removeListener('DpaySuccess', this.success);
  //     dpayEvent = null;
  //   }
  // }

  const getOrderDetails = async () => {
    // xendit staging - ZHBfbGl2ZV9RMHNtem9sQ2dxRUFTakNOOg== ZHBfdGVzdF9lZDZiYTkzYzg5N2JiNzcxOg==
    //          production - ZHBfbGl2ZV9lZDZiYTkzYzg5N2JiNzdlMDo=
    try {
      const customer = {email: 'jude_casper@koss.info'};
      const response = await fetch('https://api.durianpay.id/orders', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'ZHBfbGl2ZV9lZDZiYTkzYzg5N2JiNzdlMDo=',
        },
        body: JSON.stringify({
          amount: '15000',
          currency: 'IDR',
          order_ref_id: 'ord_key_001',
          customer: customer,
        }),
      });
      const json = await response.json();
      console.log('json', json.data.access_token);
      return json;
    } catch (error) {
      console.error(error);
    }
  };

  const success = () => {
    console.log(data);
    Alert.alert(data);
  };

  const failed = () => {
    console.log(data);
    Alert.alert(data);
  };

  const close = (data) => {
    console.log(data);
    Alert.alert(data);
  };

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const openCheckoutPage = async () => {
    console.log('open checkout');
    var ordersJson = await getOrderDetails();
    var checkoutOptions = {
      environment: 'production',
      locale: 'en',
      site_name: 'Movie Ticket',
      customer_id: 'cust_react_001',
      amount: '15000',
      currency: 'IDR',
      customer_email: 'joe@react_native.com',
      order_id: ordersJson.data.id,
      access_token: ordersJson.data.access_token,
    };
    dpayEvent = new NativeEventEmitter(NativeModules.ReactNativeEventEmitter);
    dpayEvent.addListener('DpaySuccess', success);
    dpayEvent.addListener('DpayFailure', failed);
    dpayEvent.addListener('DpayClose', (data) => {close(data)});
    CalendarManager.constantsToExport();
    RNDpaySDK.open(checkoutOptions);
    //DpaySDK
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View
        contentInsetAdjustmentBehavior="automatic"
        style={styles.container}>
        <View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={openCheckoutPage}>
            <Text>Click Here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    padding: 3,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  checkoutButton: {
    backgroundColor: 'blue',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
});

export default App;

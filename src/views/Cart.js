import React, { useEffect, useState } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { TouchableOpacity } from "react-native-gesture-handler";
import { 
  ScrollView, 
  StyleSheet, 
  Dimensions, 
  View, 
  Text, 
  NativeEventEmitter,
  NativeModules,
  Alert,
  Platform,
  ToastAndroid } from "react-native";

import { getGroceryItem } from "../services";
import {
  addToCart,
  clearFromCart,
  removeFromCart,
} from "../store/actions/grocery";
import { CartCard, EmptyState } from "../components";

function Cart({ navigation }) {
  const dispatch = useDispatch();

  const windowHeight = Dimensions.get("window").height;

  const { cart } = useSelector((state) => state.groceryState);

  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const keys = Object.keys(cart).filter((key) => !!cart[key]);
      const promises = keys.map((id) => getGroceryItem(id));
      const data = (await Promise.all(promises)).map((d) => d.data);

      setItems(data);
    })();

    dpayEvent = new NativeEventEmitter(NativeModules.RNDpaySDK);
    dpayEvent.addListener('DpaySuccess', data => {
      success(data);
    });
    dpayEvent.addListener('DpayFailure', data => {
      failed(data);
    });
    dpayEvent.addListener('DpayClose', data => {
      close(data);
    });
    return function cleanup() {
      if (dpayEvent) {
        dpayEvent.removeListener('DpaySuccess', this.success);
        dpayEvent.removeListener('DpayFailure', this.failed);
        dpayEvent.removeListener('DpayClose', this.close);
        dpayEvent = null;
      }
    };
  }, [cart]);

  const handleUpdate = ({ type, item }) => {
    if (type === "PLUS") {
      dispatch(addToCart(item));
    } else if (type === "MINUS") {
      dispatch(removeFromCart(item));
    } else if (type === "DELETE") {
      dispatch(clearFromCart(item));
    }
  };

  const total = items.reduce((a, b) => a + cart[b.id] * b.price, 0);

  const {RNDpaySdk} = NativeModules;

  var dpayEvent = null;

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
          amount: '10001',
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

  const success = data => {
    console.log(data);
    if (Platform.OS == 'ios') Alert.alert(data);
    if (Platform.OS == 'android')
      ToastAndroid.showWithGravityAndOffset(
        data,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
  };

  const failed = data => {
    console.log(data);
    if (Platform.OS == 'ios') Alert.alert(data);
    if (Platform.OS == 'android')
      ToastAndroid.showWithGravityAndOffset(
        data,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
  };

  const close = data => {
    console.log(data);
    if (Platform.OS == 'ios') Alert.alert(data);
    if (Platform.OS == 'android')
      ToastAndroid.showWithGravityAndOffset(
        data,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
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
      customer_email: 'joe@reactnative.com',
      order_id: ordersJson.data.id,
      access_token: ordersJson.data.access_token,
    };

    // console.log("native modules", Object.list(NativeModules));
    RNDpaySdk.openCheckout(checkoutOptions);
  };

  return (
    <View style={{ ...styles.container, minHeight: windowHeight }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5
            style={{ margin: 12 }}
            name="chevron-left"
            color="#424242"
            size={24}
          />
        </TouchableOpacity>
        <Text style={styles.heading}>Cart</Text>
        <View style={{ width: 45 }}></View>
      </View>
      <ScrollView>
        {items.length ? (
          <View style={{ marginTop: 8, paddingBottom: 96 }}>
            {items.map((item) => (
              <CartCard
                data={item}
                cart={cart}
                key={item.id}
                navigation={navigation}
                onUpdate={handleUpdate}
              ></CartCard>
            ))}
            <View
              style={{
                padding: 16,
                paddingVertical: 24,
                minWidth: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  color: "#424242",
                  fontFamily: "Montserrat-Regular",
                }}
              >
                Total
              </Text>
              <View style={{ flexDirection: "row", alignContent: "center" }}>
                <FontAwesome5
                  size={20}
                  color="#424242"
                  name="rupee-sign"
                  style={{ paddingTop: 7, paddingRight: 2 }}
                />
                <Text
                  style={{
                    fontSize: 24,
                    color: "#424242",
                    fontFamily: "Montserrat-SemiBold",
                  }}
                >
                  {total}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={openCheckoutPage}
              style={{
                backgroundColor: "#655DB0",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: "#FFFFFF",
                  textAlign: "center",
                  fontFamily: "Montserrat-SemiBold",
                }}
              >
                PLACE ORDER
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <EmptyState
            type="cart"
            message="No Items in cart"
            description="When you are ready, go ahead and add some"
          />
        )}
      </ScrollView>
    </View>
  );
}

Cart.sharedElements = (route) => {
  const {
    item: { cart },
  } = route.params;
  return [
    ...Object.keys(cart)
      .filter((key) => !!cart[key])
      .map((c) => `item.${c}.photo`),
  ];
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F2F2F2",
  },
  topBar: {
    minWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heading: {
    fontSize: 24,
    color: "#424242",
    textAlign: "center",
    fontFamily: "Montserrat-SemiBold",
  },
});

export default Cart;

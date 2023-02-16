import React, { FunctionComponent, useEffect } from 'react';
import useWebSocket from "react-use-websocket";

import TitleRow from "./TitleRow";
import { Container, TableContainer } from "./styles";
import PriceLevelRow from "./PriceLevelRow";
import Spread from "../Spread";
import { useAppDispatch, useAppSelector } from '../../hooks';
import { addAsks, addBids, addExistingState, selectAsks, selectBids } from './orderbookSlice';
import { MOBILE_WIDTH, ORDERBOOK_LEVELS } from "../../constants";
import Loader from "../Loader";
import DepthVisualizer from "../DepthVisualizer";
import { PriceLevelRowContainer } from "./PriceLevelRow/styles";
import { ProductsMap } from "../../App";
import { formatNumber } from "../../helpers";
import { eventNames } from 'process';

// this URL is used to subscribe the websocket, 
// after the subscribe event, we will receive the data about the bid and ask.
// for this link, the feeds first send a snapshot of the history or current state 
// and subsequently send real-time updates.
const WSS_FEED_URL: string = 'wss://www.cryptofacilities.com/ws/v1';

// object assgined with enum return index of that chlidren
// eg. orderType: OrderType = OrderType.BIDS
// console.log(orderType) return 0
export enum OrderType {
  BIDS,
  ASKS
}

interface OrderBookProps {
  windowWidth: number;
  productId: string;
  isFeedKilled: boolean;
}

interface Delta {
  bids: number[][];
  asks: number[][];
}

let currentBids: number[][] = []
let currentAsks: number[][] = []

const OrderBook: FunctionComponent<OrderBookProps> = ({ windowWidth, productId, isFeedKilled }) => {
  const bids: number[][] = useAppSelector(selectBids);
  const asks: number[][] = useAppSelector(selectAsks);
  // dispatch is used to dispatch an action
  // this hook returns a reference to the dispatch function from the Redux store. 
  // You may use it to dispatch actions as needed
  const dispatch = useAppDispatch();
  const { sendJsonMessage, getWebSocket } = useWebSocket(WSS_FEED_URL, {
    onOpen: () => console.log('WebSocket connection opened.'),
    onClose: () => console.log('WebSocket connection closed.'),
    shouldReconnect: (closeEvent) => true,
    onMessage: (event: WebSocketEventMap['message']) =>  processMessages(event)
  });

  const processMessages = (event: { data: string; }) => {
    const response = JSON.parse(event.data);
    if (response.numLevels) {
      dispatch(addExistingState(response));
    } else {
      // if this is new bid or ask order comming, process those message,
      // only after existing state is imported.
      // since the feed itself just return the newest book,
      // just need to update current state with those data
      process(response);
    }
  };

  useEffect(() => {
    function connect(product: string) {
      const unSubscribeMessage = {
        event: 'unsubscribe',
        feed: 'book_ui_1',
        product_ids: [ProductsMap[product]]
      };
      sendJsonMessage(unSubscribeMessage);

      const subscribeMessage = {
        event: 'subscribe',
        feed: 'book_ui_1',
        product_ids: [product]
      };
      sendJsonMessage(subscribeMessage);
    }

    if (isFeedKilled) {
      getWebSocket()?.close();
    } else {
      connect(productId);
    }
  }, [isFeedKilled, productId, sendJsonMessage, getWebSocket]);

  const process = (data: Delta) => {
    if (data?.bids?.length > 0) {
      currentBids = [...currentBids, ...data.bids];

      if (currentBids.length > ORDERBOOK_LEVELS) {
        dispatch(addBids(currentBids));
        currentBids = [];
        currentBids.length = 0;
      }
    }
    if (data?.asks?.length >= 0) {
      currentAsks = [...currentAsks, ...data.asks];

      if (currentAsks.length > ORDERBOOK_LEVELS) {
        dispatch(addAsks(currentAsks));
        currentAsks = [];
        currentAsks.length = 0;
      }
    }
  };

  const formatPrice = (arg: number): string => {
    return arg.toLocaleString("en", { useGrouping: true, minimumFractionDigits: 2 })
  };

  const buildPriceLevels = (levels: number[][], orderType: OrderType = OrderType.BIDS): React.ReactNode => {
    // first, sort the levels
    const sortedLevelsByPrice: number[][] = [ ...levels ].sort(
      (currentLevel: number[], nextLevel: number[]): number => {
        let result: number = 0;
        if (orderType === OrderType.BIDS || windowWidth < MOBILE_WIDTH) {
          result = nextLevel[0] - currentLevel[0];
        } else {
          result = currentLevel[0] - nextLevel[0];
        }
        return result;
      }
    );

    return (
      sortedLevelsByPrice.map((level, idx) => {
        const calculatedTotal: number = level[2];
        const total: string = formatNumber(calculatedTotal);
        const depth = level[3];
        const size: string = formatNumber(level[1]);
        const price: string = formatPrice(level[0]);

        return (
          <PriceLevelRowContainer key={idx + depth}>
            <DepthVisualizer key={depth} windowWidth={windowWidth} depth={depth} orderType={orderType} />
            <PriceLevelRow key={size + total}
                           total={total}
                           size={size}
                           price={price}
                           reversedFieldsOrder={orderType === OrderType.ASKS}
                           windowWidth={windowWidth} />
          </PriceLevelRowContainer>
        );
      })
    );
  };

  return (
    <Container>
      {bids.length && asks.length ?
        <>
          <TableContainer>
            {/* only windowWidth > MOBILE_WIDTH, title column for bids is shown */}
            {windowWidth > MOBILE_WIDTH && <TitleRow windowWidth={windowWidth} reversedFieldsOrder={false} />}
            <div>{buildPriceLevels(bids, OrderType.BIDS)}</div>
          </TableContainer>
          <Spread bids={bids} asks={asks} />
          <TableContainer>
            <TitleRow windowWidth={windowWidth} reversedFieldsOrder={true} />
            <div>
              {buildPriceLevels(asks, OrderType.ASKS)}
            </div>
          </TableContainer>
        </> :
        <Loader />}
    </Container>
  )
};

export default OrderBook;

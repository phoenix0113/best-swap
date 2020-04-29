import {
  all,
  delay,
  takeEvery,
  put,
  fork,
  call,
  take,
} from 'redux-saga/effects';

import { Method, AxiosResponse } from 'axios';
import {
  Token,
  Market,
  TickerStatistics,
  Account,
  TxPage,
  OrderList,
  TransferEvent,
} from '@thorchain/asgardex-binance';
import { eventChannel, END } from 'redux-saga';
import * as actions from './actions';
import {
  getBinanceTestnetURL,
  getBinanceMainnetURL,
  getHeaders,
  axiosRequest,
} from '../../helpers/apiHelper';
import { getTickerFormat } from '../../helpers/stringHelper';
import { getTokenName } from '../../helpers/assetHelper';
import { Maybe, Nothing, FixmeType } from '../../types/bepswap';
import { NET } from '../../env';

/* /////////////////////////////////////////////////////////////
// api
///////////////////////////////////////////////////////////// */

const LIMIT = 1000;

export function* getBinanceTokens() {
  yield takeEvery('GET_BINANCE_TOKENS', function*() {
    const params = {
      method: 'get' as Method,
      url: getBinanceTestnetURL(`tokens?limit=${LIMIT}`),
      headers: getHeaders(),
    };

    try {
      const { data }: AxiosResponse<Token[]> = yield call(axiosRequest, params);

      yield put(actions.getBinanceTokensSuccess(data));
    } catch (error) {
      yield put(actions.getBinanceTokensFailed(error));
    }
  });
}

export function* getBinanceMarkets() {
  yield takeEvery('GET_BINANCE_MARKETS', function*() {
    const params = {
      method: 'get' as Method,
      url: getBinanceTestnetURL(`markets?limit=${LIMIT}`),
      headers: getHeaders(),
    };

    try {
      const { data }: AxiosResponse<Market[]> = yield call(
        axiosRequest,
        params,
      );

      yield put(actions.getBinanceMarketsSuccess(data));
    } catch (error) {
      yield put(actions.getBinanceMarketsFailed(error));
    }
  });
}

export function* getBinanceTicker() {
  yield takeEvery('GET_BINANCE_TICKER', function*({
    payload,
  }: ReturnType<typeof actions.getBinanceTicker>) {
    const ticker = getTickerFormat(payload);
    const tokenName = getTokenName(ticker);

    const params = {
      method: 'get' as Method,
      url: getBinanceMainnetURL(`ticker/24hr?symbol=${tokenName}_BNB`),
      headers: getHeaders(),
    };

    try {
      const { data }: AxiosResponse<TickerStatistics[]> = yield call(
        axiosRequest,
        params,
      );

      yield put(actions.getBinanceTickerSuccess(data));
    } catch (error) {
      yield put(actions.getBinanceTickerFailed(error));
    }
  });
}

export function* getBinanceAccount() {
  yield takeEvery('GET_BINANCE_ACCOUNT', function*({
    payload,
  }: ReturnType<typeof actions.getBinanceAccount>) {
    const params = {
      method: 'get' as Method,
      url: getBinanceTestnetURL(`account/${payload}`),
      headers: getHeaders(),
    };

    try {
      const { data }: AxiosResponse<Account> = yield call(axiosRequest, params);

      yield put(actions.getBinanceAccountSuccess(data));
    } catch (error) {
      yield put(actions.getBinanceAccountFailed(error));
    }
  });
}

export function* getBinanceTransactions() {
  yield takeEvery('GET_BINANCE_TRANSACTIONS', function*({
    payload,
  }: ReturnType<typeof actions.getBinanceTransactions>) {
    const { address, symbol, startTime, endTime, limit } = payload;

    const params = {
      method: 'get' as Method,
      url: getBinanceTestnetURL(
        `transactions?address=${address}&txAsset=${symbol}&startTime=${startTime}&endTime=${endTime}&limit=${limit}`,
      ),
      headers: getHeaders(),
    };

    try {
      const { data }: AxiosResponse<TxPage> = yield call(axiosRequest, params);

      yield put(actions.getBinanceTransactionsSuccess(data));
    } catch (error) {
      yield put(actions.getBinanceTransactionsFailed(error));
    }
  });
}

export function* getBinanceOpenOrders() {
  yield takeEvery('GET_BINANCE_OPEN_ORDERS', function*({
    payload,
  }: ReturnType<typeof actions.getBinanceOpenOrders>) {
    const { address, symbol } = payload;

    const params = {
      method: 'get' as Method,
      url: getBinanceTestnetURL(
        `orders/open?address=${address}&symbol=${symbol}`,
      ),
      headers: getHeaders(),
    };

    try {
      const { data }: AxiosResponse<OrderList> = yield call(
        axiosRequest,
        params,
      );

      yield put(actions.getBinanceOpenOrdersSuccess(data));
    } catch (error) {
      yield put(actions.getBinanceOpenOrdersFailed(error));
    }
  });
}

/* /////////////////////////////////////////////////////////////
// websockets
///////////////////////////////////////////////////////////// */

export const WS_MAX_RETRY = 5;
export const WS_RETRY_DELAY = 300; // ms

const TESTNET_WS_URI =
  process.env.REACT_APP_BINANCE_TESTNET_WS_URI ||
  'wss://testnet-dex.binance.org/api/ws';

const MAINET_WS_URI =
  process.env.REACT_APP_BINANCE_MAINNET_WS_URI ||
  'wss://dex.binance.org/api/ws';

function createBinanceTransfersChannel(ws: WebSocket) {
  return eventChannel(emit => {
    const onOpenHandler = (e: Event) => {
      emit(e);
    };
    const onMessageHandler = (e: MessageEvent) => {
      emit(e);
    };
    const onCloseHandler = (_: CloseEvent) => {
      // END will close channel
      emit(END);
    };
    const onErrorHandler = (e: Event) => {
      emit(e);
    };

    // subscriptions
    ws.addEventListener('open', onOpenHandler);
    ws.addEventListener('error', onErrorHandler);
    ws.addEventListener('message', onMessageHandler);
    ws.addEventListener('close', onCloseHandler);

    // Unsubscribe function
    // invoked by `channel.close()`
    const unsubscribe = () => {
      ws.removeEventListener('open', onOpenHandler);
      ws.removeEventListener('error', onErrorHandler);
      ws.removeEventListener('message', onMessageHandler);
      ws.removeEventListener('close', onCloseHandler);
      // close WS connection
      ws.close();
    };

    return unsubscribe;
  });
}

let binanceTransfersChannel: Maybe<FixmeType> = Nothing;
const destroyBinanceTransfersChannel = () => {
  // closing channel will close ws connection, too
  binanceTransfersChannel?.close();
  binanceTransfersChannel = Nothing;
};

function* trySubscribeBinanceTransfers(
  payload: actions.SubscribeBinanceTransfersPayload,
) {
  const { net, address } = payload;
  const url = net === NET.MAIN ? MAINET_WS_URI : TESTNET_WS_URI;
  for (let i = 0; i < WS_MAX_RETRY; i++) {
    try {
      // destroy previous channel if there any
      destroyBinanceTransfersChannel();
      const ws = new WebSocket(url);
      binanceTransfersChannel = yield call(createBinanceTransfersChannel, ws);

      while (true) {
        const channelEvent: Event = yield take(binanceTransfersChannel);
        // BTW: No need to handle channelEvent.type === 'close' here,
        // since `binanceTransfersChannel` will close then

        if (channelEvent.type === 'error') {
          // throw error to trigger re-connection
          throw new Error('Error while subscribing to Binance.');
        }
        if (channelEvent.type === 'open') {
          // subscribe to transfers
          (channelEvent.target as WebSocket).send(
            JSON.stringify({
              method: 'subscribe',
              topic: 'transfers',
              address,
            }),
          );
        }
        if (channelEvent.type === 'message') {
          try {
            const result = JSON.parse(
              (channelEvent as MessageEvent).data,
            ) as TransferEvent;
            yield put(actions.binanceTransfersMessageReceived(result));
          } catch (error) {
            yield put(actions.subscribeBinanceTransfersFailed(error));
          }
        }
      }
    } catch (error) {
      if (i < WS_MAX_RETRY - 1) {
        yield delay(WS_RETRY_DELAY);
      }
    }
  }
  throw new Error(`Connecting to ${url} failed after ${WS_MAX_RETRY} attemps.`);
}

function* subscribeBinanceTransfers() {
  yield takeEvery('SUBSCRIBE_BINANCE_TRANSFERS', function*({
    payload,
  }: ReturnType<typeof actions.subscribeBinanceTransfers>) {
    try {
      binanceTransfersChannel = yield call(
        trySubscribeBinanceTransfers,
        payload,
      );
    } catch (error) {
      yield put(actions.subscribeBinanceTransfersFailed(error));
    }
  });
}

function* unSubscribeBinanceTransfers() {
  yield takeEvery('UNSUBSCRIBE_BINANCE_TRANSFERS', function*() {
    yield destroyBinanceTransfersChannel();
  });
}

export default function* rootSaga() {
  yield all([
    fork(getBinanceTokens),
    fork(getBinanceMarkets),
    fork(getBinanceTicker),
    fork(getBinanceAccount),
    fork(getBinanceTransactions),
    fork(getBinanceOpenOrders),
    fork(subscribeBinanceTransfers),
    fork(unSubscribeBinanceTransfers),
  ]);
}

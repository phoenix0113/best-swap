import { all, takeEvery, put, fork, call } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import { isEmpty as _isEmpty } from 'lodash';

import { AxiosResponse } from 'axios';
import { Balance, Market, client as binanceClient, Address } from '@thorchain/asgardex-binance';
import { bnOrZero, bn } from '@thorchain/asgardex-util';
import * as api from '../../helpers/apiHelper';

import {
  saveWalletAddress,
  saveKeystore,
  clearWalletAddress,
  clearKeystore,
} from '../../helpers/webStorageHelper';

import * as actions from './actions';
import { AssetData, StakeData } from './types';
import {
  StakersAddressData,
  PoolDetail,
  StakersAssetData,
} from '../../types/generated/midgard';
import { getAssetFromString } from '../midgard/utils';

import { baseToToken, baseAmount, tokenAmount } from '../../helpers/tokenHelper';
import { BINANCE_NET, getNet } from '../../env';
import { getApiBasePath } from '../midgard/saga';

export function* saveWalletSaga() {
  yield takeEvery(actions.SAVE_WALLET, function*({
    payload,
  }: actions.SaveWallet) {
    const { wallet, keystore } = payload;

    saveWalletAddress(wallet);
    saveKeystore(keystore);

    yield put(actions.refreshBalance(wallet));
    yield put(actions.refreshStake(wallet));
  });
}

export function* forgetWalletSaga() {
  yield takeEvery(actions.FORGET_WALLET, function*() {
    clearWalletAddress();
    clearKeystore();

    yield put(push('/connect'));
  });
}

export function* refreshBalance() {
  yield takeEvery(actions.REFRESH_BALANCE, function*({
    payload,
  }: actions.RefreshBalance) {
    const address = payload;

    try {
      const bncClient = yield call(binanceClient, BINANCE_NET);
      const balances: Balance[] = yield call(bncClient.getBalance, address);

      try {
        const markets: { result: Market[] } = yield call(bncClient.getMarkets);
        // TODO(Veado): token or base amounts?
        const coins = balances.map((coin: Balance) => {
          const market = markets.result.find(
            (market: Market) => market.base_asset_symbol === coin.symbol,
          );
          return {
            asset: coin.symbol,
            assetValue: tokenAmount(coin.free),
            price: market ? bnOrZero(market.list_price) : bn(0),
          } as AssetData;
        });

        yield put(actions.refreshBalanceSuccess(coins));
      } catch (error) {
        yield put(actions.refreshBalanceFailed(error));
      }
    } catch (error) {
      yield put(actions.refreshBalanceFailed(error));
    }
  });
}

type StakersAssetDataMap = {
  [symbol: string]: StakersAssetData;
};

export function* getUserStakeData(payload: {
  address: Address;
  assets: string[];
}) {
  const { address, assets } = payload;

  let basePath: string = yield call(getApiBasePath, getNet());
  let midgardApi = api.getMidgardDefaultApi(basePath);
  // (Request 1) Load list of possible `StakersAssetData`
  const { data }: AxiosResponse<StakersAssetData[]> = yield call(
    { context: midgardApi, fn: midgardApi.getStakersAddressAndAssetData },
    address,
    assets.join(),
  );

  // Transform `StakersAssetData[]` into a map of `{[symbol]: StakersAssetData}` to access data it more easily
  const poolDetailMap: StakersAssetDataMap =
    data && !_isEmpty(data)
      ? data.reduce((acc: StakersAssetDataMap, assetData: StakersAssetData) => {
          const asset = assetData.asset;
          return asset
            ? {
                ...acc,
                [asset]: assetData,
              }
            : acc;
        }, {})
      : {};

  // (Request 2) Load list of possible `PoolDetail`
  // And we do need to check `basePath` again before
  basePath = yield call(getApiBasePath, getNet());
  midgardApi = api.getMidgardDefaultApi(basePath);
  const { data: poolDataList }: AxiosResponse<PoolDetail[]> = yield call(
    { context: midgardApi, fn: midgardApi.getPoolsData },
    assets.join(),
  );

  // Transform results of requests 1 + 2 into `StakeData[]`
  const stakeDataList: StakeData[] = poolDataList.reduce(
    (acc: StakeData[], poolData: PoolDetail) => {
      const userStakerData = poolData.asset
        ? poolDetailMap[poolData.asset]
        : null;
      if (userStakerData && poolData.asset) {
        const price = poolData?.price ?? 0;
        const { symbol = '', ticker = '' } = getAssetFromString(poolData.asset);
        const stakeData: StakeData = {
          targetSymbol: symbol,
          target: ticker.toLowerCase(),
          targetValue: baseToToken(baseAmount(userStakerData?.assetStaked)),
          assetValue: baseToToken(baseAmount(userStakerData?.runeStaked)),
          asset: 'rune',
          price,
        } as StakeData;
        return [...acc, stakeData];
      } else {
        return acc;
      }
    },
    [],
  );
  return stakeDataList;
}

export function* refreshStakes() {
  yield takeEvery(actions.REFRESH_STAKES, function*({
    payload,
  }: actions.RefreshStakes) {
    const address = payload;

    try {
      const basePath: string = yield call(getApiBasePath, getNet());
      const midgardApi = api.getMidgardDefaultApi(basePath);
      const { data }: AxiosResponse<StakersAddressData> = yield call(
        { context: midgardApi, fn: midgardApi.getStakersAddressData },
        address,
      );

      if (data.poolsArray && !_isEmpty(data?.poolsArray)) {
        const result: StakeData[] = yield call(getUserStakeData, {
          address,
          assets: data?.poolsArray,
        });
        yield put(actions.refreshStakeSuccess(result));
      } else {
        yield put(actions.refreshStakeSuccess([]));
      }
    } catch (error) {
      yield put(actions.refreshStakeFailed(error));
    }
  });
}

export default function* rootSaga() {
  yield all([
    fork(saveWalletSaga),
    fork(forgetWalletSaga),
    fork(refreshBalance),
    fork(refreshStakes),
  ]);
}

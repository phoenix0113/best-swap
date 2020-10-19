import { AssetSymbol } from '../../types/bepswap';
import {
  GetStakerPoolDataPayload,
  PriceDataIndex,
  AssetDetailMap,
  GetTransactionPayload,
  GetTxByAddressTxIdPayload,
  GetTxByAddressAssetPayload,
  GetTxByAddressPayload,
  GetTxByAssetPayload,
  GetPoolDataPayload,
  GetRTVolumeByAssetPayload,
  GetRTAggregateByAssetPayload,
  GetPoolDetailByAssetPayload,
  ThorchainData,
} from './types';
import {
  AssetDetail,
  PoolDetail,
  StatsData,
  StakersAssetData,
  ThorchainEndpoints,
  InlineResponse2001,
  TotalVolChanges,
  NetworkInfo,
} from '../../types/generated/midgard';

export type SetAssetsPayload = {
  assetDetailIndex: AssetDetailMap;
  assetDetails: AssetDetail[];
};
export const setAssets = (payload: SetAssetsPayload) =>
  ({ type: 'SET_ASSETS', payload } as const);

export const getPools = () => ({ type: 'GET_POOLS_REQUEST' } as const);

export const getPoolsSuccess = (payload: string[]) =>
  ({ type: 'GET_POOLS_SUCCESS', payload } as const);

export const getPoolsFailed = (payload: Error) =>
  ({ type: 'GET_POOLS_FAILED', payload } as const);

export const getPoolData = (payload: GetPoolDataPayload) =>
  ({ type: 'GET_POOL_DATA_REQUEST', payload } as const);

type GetPoolDataSuccessPayload = {
  poolDetails: PoolDetail[];
  overrideAllPoolData: boolean;
};
export const getPoolDataSuccess = (payload: GetPoolDataSuccessPayload) =>
  ({ type: 'GET_POOL_DATA_SUCCESS', payload } as const);

export const getPoolDataFailed = (payload: Error) =>
  ({ type: 'GET_POOL_DATA_FAILED', payload } as const);

export const getPoolDetailByAsset = (payload: GetPoolDetailByAssetPayload) =>
  ({ type: 'GET_POOL_DETAIL_BY_ASSET', payload } as const);

export const getPoolDetailByAssetSuccess = (payload: PoolDetail[]) =>
  ({ type: 'GET_POOL_DETAIL_BY_ASSET_SUCCESS', payload } as const);

export const getPoolDetailByAssetFailed = (payload: Error) =>
  ({ type: 'GET_POOL_DETAIL_BY_ASSET_FAILED', payload } as const);

export const getStakerPoolData = (payload: GetStakerPoolDataPayload) =>
  ({ type: 'GET_STAKER_POOL_DATA_REQUEST', payload } as const);

export const getStakerPoolDataSuccess = (payload: StakersAssetData[]) =>
  ({ type: 'GET_STAKER_POOL_DATA_SUCCESS', payload } as const);

export const getStakerPoolDataFailed = (payload: Error) =>
  ({ type: 'GET_STAKER_POOL_DATA_FAILED', payload } as const);

export const getThorchainDataSuccess = (payload: ThorchainData) =>
  ({ type: 'GET_THORCHAIN_DATA_SUCCESS', payload } as const);

export const getPoolAddress = () =>
  ({ type: 'GET_POOL_ADDRESSES_REQUEST' } as const);

export const getPoolAddressSuccess = (payload: ThorchainEndpoints) =>
  ({ type: 'GET_POOL_ADDRESSES_SUCCESS', payload } as const);

export const getPoolAddressFailed = (payload: Error) =>
  ({ type: 'GET_POOL_ADDRESSES_FAILED', payload } as const);

export const getRunePrice = () => ({ type: 'GET_RUNE_PRICE_REQUEST' } as const);

export const setBasePriceAsset = (payload: AssetSymbol) =>
  ({ type: 'SET_BASE_PRICE_ASSET', payload } as const);

export const setPriceIndex = (payload: PriceDataIndex) =>
  ({ type: 'SET_PRICE_INDEX', payload } as const);

export const getTransaction = (payload: GetTransactionPayload) =>
  ({ type: 'GET_TRANSACTION', payload } as const);

export const getTransactionSuccess = (payload: InlineResponse2001) =>
  ({ type: 'GET_TRANSACTION_SUCCESS', payload } as const);

export const getTransactionFailed = (payload: Error) =>
  ({ type: 'GET_TRANSACTION_FAILED', payload } as const);

export const getTransactionWithRefresh = (payload: GetTransactionPayload) =>
  ({ type: 'GET_TRANSACTION_WITH_REFRESH', payload } as const);

export const getTransactionWithRefreshSuccess = (payload: InlineResponse2001) =>
  ({ type: 'GET_TRANSACTION_WITH_REFRESH_SUCCESS', payload } as const);

export const getTransactionWithRefreshFailed = (payload: Error) =>
  ({ type: 'GET_TRANSACTION_WITH_REFRESH_FAILED', payload } as const);

// get transactions by address
export const getTxByAddress = (payload: GetTxByAddressPayload) =>
  ({ type: 'GET_TX_BY_ADDRESS', payload } as const);

export const getTxByAddressSuccess = (payload: InlineResponse2001) =>
  ({ type: 'GET_TX_BY_ADDRESS_SUCCESS', payload } as const);

export const getTxByAddressFailed = (payload: Error) =>
  ({ type: 'GET_TX_BY_ADDRESS_FAILED', payload } as const);

// get transactions by address and txId
export const getTxByAddressTxId = (payload: GetTxByAddressTxIdPayload) =>
  ({ type: 'GET_TX_BY_ADDRESS_TXID', payload } as const);

export const getTxByAddressTxIdSuccess = (payload: InlineResponse2001) =>
  ({ type: 'GET_TX_BY_ADDRESS_TXID_SUCCESS', payload } as const);

export const getTxByAddressTxIdFailed = (payload: Error) =>
  ({ type: 'GET_TX_BY_ADDRESS_TXID_FAILED', payload } as const);

// get transactions by address and asset
export const getTxByAddressAsset = (payload: GetTxByAddressAssetPayload) =>
  ({ type: 'GET_TX_BY_ADDRESS_ASSET', payload } as const);

export const getTxByAddressAssetSuccess = (payload: InlineResponse2001) =>
  ({ type: 'GET_TX_BY_ADDRESS_ASSET_SUCCESS', payload } as const);

export const getTxByAddressAssetFailed = (payload: Error) =>
  ({ type: 'GET_TX_BY_ADDRESS_ASSET_FAILED', payload } as const);

// get transactions by asset
export const getTxByAsset = (payload: GetTxByAssetPayload) =>
  ({ type: 'GET_TX_BY_ASSET', payload } as const);

export const getTxByAssetSuccess = (payload: InlineResponse2001) =>
  ({ type: 'GET_TX_BY_ASSET_SUCCESS', payload } as const);

export const getTxByAssetFailed = (payload: Error) =>
  ({ type: 'GET_TX_BY_ASSET_FAILED', payload } as const);

export const getApiBasePathPending = () =>
  ({ type: 'GET_API_BASEPATH_PENDING' } as const);

export const getApiBasePathFailed = (payload: Error) =>
  ({ type: 'GET_API_BASEPATH_FAILED', payload } as const);

export const getApiBasePathSuccess = (payload: string) =>
  ({ type: 'GET_API_BASEPATH_SUCCESS', payload } as const);

export const getStats = () => ({ type: 'GET_STATS_REQUEST' } as const);

export const getStatsSuccess = (payload: StatsData) =>
  ({ type: 'GET_STATS_SUCCESS', payload } as const);

export const getStatsFailed = (payload: Error) =>
  ({ type: 'GET_STATS_FAILED', payload } as const);

export const getRTVolumeByAsset = (payload: GetRTVolumeByAssetPayload) =>
  ({ type: 'GET_RT_VOLUME_BY_ASSET', payload } as const);

export const getRTVolumeByAssetSuccess = (payload: Array<TotalVolChanges>) =>
  ({ type: 'GET_RT_VOLUME_BY_ASSET_SUCCESS', payload } as const);

export const getRTVolumeByAssetFailed = (payload: Error) =>
  ({ type: 'GET_RT_VOLUME_BY_ASSET_FAILED', payload } as const);

export const getRTAggregateByAsset = (payload: GetRTAggregateByAssetPayload) =>
  ({ type: 'GET_RT_AGGREGATE_BY_ASSET', payload } as const);

export const getRTAggregateByAssetSuccess = (payload: Array<TotalVolChanges>) =>
  ({ type: 'GET_RT_AGGREGATE_BY_ASSET_SUCCESS', payload } as const);

export const getRTAggregateByAssetFailed = (payload: Error) =>
  ({ type: 'GET_RT_AGGREGATE_BY_ASSET_FAILED', payload } as const);

export const getNetworkInfo = () =>
  ({ type: 'GET_NETWORK_INFO_REQUEST' } as const);

export const getNetworkInfoSuccess = (payload: NetworkInfo) =>
  ({ type: 'GET_NETWORK_INFO_SUCCESS', payload } as const);

export const getNetworkInfoFailed = (payload: Error) =>
  ({ type: 'GET_NETWORK_INFO_FAILED', payload } as const);

export type MidgardActionTypes = ReturnType<
  | typeof getPools
  | typeof getPoolsSuccess
  | typeof getPoolsFailed
  | typeof getPoolData
  | typeof getPoolDataSuccess
  | typeof getPoolDataFailed
  | typeof getStakerPoolData
  | typeof getStakerPoolDataSuccess
  | typeof getStakerPoolDataFailed
  | typeof getPoolAddress
  | typeof getPoolAddressSuccess
  | typeof getPoolAddressFailed
  | typeof getRunePrice
  | typeof setAssets
  | typeof setBasePriceAsset
  | typeof setPriceIndex
  | typeof getTransaction
  | typeof getTransactionSuccess
  | typeof getTransactionFailed
  | typeof getTransactionWithRefresh
  | typeof getTransactionWithRefreshSuccess
  | typeof getTransactionWithRefreshFailed
  | typeof getTxByAddress
  | typeof getTxByAddressSuccess
  | typeof getTxByAddressFailed
  | typeof getTxByAddressTxId
  | typeof getTxByAddressTxIdSuccess
  | typeof getTxByAddressTxIdFailed
  | typeof getTxByAddressAsset
  | typeof getTxByAddressAssetSuccess
  | typeof getTxByAddressAssetFailed
  | typeof getTxByAsset
  | typeof getTxByAssetSuccess
  | typeof getTxByAssetFailed
  | typeof getApiBasePathPending
  | typeof getApiBasePathFailed
  | typeof getApiBasePathSuccess
  | typeof getThorchainDataSuccess
  | typeof getStats
  | typeof getStatsSuccess
  | typeof getStatsFailed
  | typeof getRTVolumeByAsset
  | typeof getRTVolumeByAssetSuccess
  | typeof getRTVolumeByAssetFailed
  | typeof getRTAggregateByAsset
  | typeof getRTAggregateByAssetSuccess
  | typeof getRTAggregateByAssetFailed
  | typeof getPoolDetailByAsset
  | typeof getPoolDetailByAssetSuccess
  | typeof getPoolDetailByAssetFailed
  | typeof getNetworkInfo
  | typeof getNetworkInfoSuccess
  | typeof getNetworkInfoFailed
>;

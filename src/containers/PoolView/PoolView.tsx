import React, { useEffect, useState } from 'react';
import * as H from 'history';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter, useHistory, Link } from 'react-router-dom';
import { Row, Col } from 'antd';
import {
  SyncOutlined,
  SwapOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';

import Label from '../../components/uielements/label';
import AddIcon from '../../components/uielements/addIcon';
import CoinIcon from '../../components/uielements/coins/coinIcon';
import Table from '../../components/uielements/table';
import Button from '../../components/uielements/button';
import PoolFilter from '../../components/poolFilter';
import StatBar from '../../components/statBar';

import {
  ContentWrapper,
  ActionHeader,
  ActionColumn,
  TransactionWrapper,
} from './PoolView.style';
import {
  getAvailableTokensToCreate,
  getPoolData,
} from '../../helpers/utils/poolUtils';
import { PoolData } from '../../helpers/utils/types';
import { getTickerFormat } from '../../helpers/stringHelper';

import * as midgardActions from '../../redux/midgard/actions';
import { RootState } from '../../redux/store';
import { AssetData, User } from '../../redux/wallet/types';
import {
  PoolDataMap,
  PriceDataIndex,
  AssetDetailMap,
  TxDetailData,
} from '../../redux/midgard/types';
import { getAssetFromString } from '../../redux/midgard/utils';
import { ViewType, Maybe } from '../../types/bepswap';
import {
  PoolDetailStatusEnum,
  StatsData,
} from '../../types/generated/midgard/api';
import showNotification from '../../components/uielements/notification';
import { RUNE_SYMBOL } from '../../settings/assetData';

import LabelLoader from '../../components/utility/loaders/label';
import TxTable from '../../components/transaction/txTable';

type Props = {
  history: H.History;
  pools: string[];
  poolData: PoolDataMap;
  txData: TxDetailData;
  stats: StatsData;
  assets: AssetDetailMap;
  priceIndex: PriceDataIndex;
  assetData: AssetData[];
  user: Maybe<User>;
  poolLoading: boolean;
  assetLoading: boolean;
  poolDataLoading: boolean;
  getPools: typeof midgardActions.getPools;
  getPoolAddress: typeof midgardActions.getPoolAddress;
  getTransactions: typeof midgardActions.getTransaction;
};

const PoolView: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    pools,
    poolData,
    txData,
    stats,
    assets,
    priceIndex,
    assetData,
    user,
    poolLoading,
    assetLoading,
    poolDataLoading,
    getPools,
    getPoolAddress,
    getTransactions,
  } = props;

  const [poolStatus, selectPoolStatus] = useState<PoolDetailStatusEnum>(
    PoolDetailStatusEnum.Enabled,
  );
  const history = useHistory();

  const loading = poolLoading || poolDataLoading;
  const wallet: Maybe<string> = user ? user.wallet : null;
  const busdPrice = assets?.['BUSD-BAF']?.priceRune ?? '1';

  useEffect(() => {
    getTransactions({ offset: 0, limit: 10 });
  }, [getTransactions]);

  const handleGetPools = () => {
    getPools();
  };

  const handleNewPool = () => {
    if (!wallet) {
      showNotification({
        type: 'warning',
        message: 'Create Pool Failed',
        description: 'Please connect your wallet to add a new pool.',
      });
    } else {
      const possibleTokens = getAvailableTokensToCreate(assetData, pools);
      if (possibleTokens.length) {
        const symbol = possibleTokens[0].asset;
        if (getTickerFormat(symbol) !== 'rune') {
          const URL = `/pool/${symbol}/new`;
          history.push(URL);
        }
      } else {
        showNotification({
          type: 'warning',
          message: 'Create Pool Failed',
          description: 'You don\'t have available asset to create a new pool.',
        });
      }
    }
  };

  const renderCell = (text: string) => {
    if (loading) {
      return <LabelLoader />;
    }
    return <span>{text}</span>;
  };

  const renderPoolPriceCell = (text: string) => {
    if (assetLoading) {
      return <LabelLoader />;
    }
    return <span>{text}</span>;
  };

  const handleStakeAction = (url: string) => {
    getPoolAddress();
    history.push(url);
  };

  const handleSwapAction = (url: string) => {
    getPoolAddress();
    history.push(url);
  };

  const renderPoolTable = (poolViewData: PoolData[], view: ViewType) => {
    const buttonCol = {
      key: 'stake',
      title: (
        <ActionHeader>
          <Button onClick={handleGetPools} typevalue="outline" round="true">
            <SyncOutlined />
            refresh
          </Button>
        </ActionHeader>
      ),
      render: (text: string, record: PoolData) => {
        const { target, values } = record;
        if (target) {
          const swapUrl = `/swap/${RUNE_SYMBOL}:${values.symbol}`;
          const stakeUrl = `/pool/${values.symbol.toUpperCase()}`;

          return (
            <ActionColumn>
              <div className="action-column-wrapper">
                <Link to={stakeUrl}>
                  <Button
                    style={{ margin: 'auto' }}
                    round="true"
                    typevalue="outline"
                  >
                    <DatabaseOutlined />
                    stake
                  </Button>
                </Link>
                {poolStatus !== PoolDetailStatusEnum.Bootstrapped && (
                  <Link to={swapUrl}>
                    <Button style={{ margin: 'auto' }} round="true">
                      <SwapOutlined />
                      swap
                    </Button>
                  </Link>
                )}
              </div>
            </ActionColumn>
          );
        }
      },
    };
    const mobileColumns = [
      {
        key: 'pool',
        title: 'pool',
        dataIndex: 'pool',
        render: ({ target }: { target: string }) => (
          <Row>
            <Col xs={24} style={{ display: 'flex', justifyContent: 'center' }}>
              <CoinIcon type={target} />
            </Col>
          </Row>
        ),
      },
      buttonCol,
    ];
    const desktopColumns = [
      {
        key: 'pool',
        title: 'pool',
        dataIndex: 'pool',
        render: ({ target }: { target: string }) => (
          <Row>
            <Col xs={24} style={{ display: 'flex', justifyContent: 'center' }}>
              <CoinIcon type={target} />
            </Col>
          </Row>
        ),
      },
      {
        key: 'asset',
        title: 'asset',
        dataIndex: 'pool',
        render: ({ target }: { target: string }) => <p>{target}</p>,
        sorter: (a: PoolData, b: PoolData) => a.target.localeCompare(b.target),
        sortDirections: ['descend', 'ascend'],
      },
      {
        key: 'poolprice',
        title: 'pool price',
        dataIndex: ['values', 'poolPrice'],
        render: renderPoolPriceCell,
        sorter: (a: PoolData, b: PoolData) => a.poolPrice.minus(b.poolPrice),
        sortDirections: ['descend', 'ascend'],
        defaultSortOrder:
          poolStatus === PoolDetailStatusEnum.Enabled ? 'descend' : undefined,
      },
      {
        key: 'depth',
        title: 'depth',
        dataIndex: ['values', 'depth'],
        render: renderCell,
        sorter: (a: PoolData, b: PoolData) =>
          a.depth.amount().minus(b.depth.amount()),
        sortDirections: ['descend', 'ascend'],
        defaultSortOrder:
          poolStatus !== PoolDetailStatusEnum.Enabled ? 'descend' : undefined,
      },
      {
        key: 'volume24',
        title: '24h vol',
        dataIndex: ['values', 'volume24'],
        render: renderCell,
        sorter: (a: PoolData, b: PoolData) =>
          a.volume24.amount().minus(b.volume24.amount()),
        sortDirections: ['descend', 'ascend'],
      },
      {
        key: 'roiAT',
        title: 'APR',
        dataIndex: ['values', 'roiAT'],
        render: renderCell,
        sorter: (a: PoolData, b: PoolData) => Number(a.roiAT) - Number(b.roiAT),
        sortDirections: ['descend', 'ascend'],
      },
      buttonCol,
    ];

    const columnData = {
      desktop: desktopColumns,
      mobile: mobileColumns,
    };
    const columns = columnData[view] || desktopColumns;

    return (
      <Table
        columns={columns}
        dataSource={poolViewData}
        loading={poolLoading}
        rowKey="key"
        key={poolStatus}
      />
    );
  };

  const renderPoolList = (view: ViewType) => {
    const poolViewData = pools.map((poolName, index) => {
      const { symbol = '' } = getAssetFromString(poolName);

      const poolInfo = poolData[symbol] || {};

      const poolDataDetail: PoolData = getPoolData(
        symbol,
        poolInfo,
        priceIndex,
      );

      return {
        ...poolDataDetail,
        status: poolInfo?.status ?? null,
        key: index,
      };
    });

    const filteredData = poolViewData.filter(poolData => {
      return (
        (poolStatus === PoolDetailStatusEnum.Enabled && !poolData.status) ||
        poolData.status === poolStatus
      );
    });

    return renderPoolTable(filteredData, view);
  };

  return (
    <ContentWrapper className="pool-view-wrapper">
      <StatBar stats={stats} basePrice={busdPrice} />
      <PoolFilter selected={poolStatus} onClick={selectPoolStatus} />
      <div className="pool-list-view desktop-view">
        {renderPoolList(ViewType.DESKTOP)}
      </div>
      <div className="pool-list-view mobile-view">
        {renderPoolList(ViewType.MOBILE)}
      </div>
      <div className="add-new-pool" onClick={handleNewPool}>
        <AddIcon />
        <Label size="normal" weight="bold" color="normal">
          ADD NEW POOL
        </Label>
      </div>
      <TransactionWrapper>
        <Label size="big" color="primary">
          Transactions
        </Label>
        <TxTable txData={txData} />
      </TransactionWrapper>
    </ContentWrapper>
  );
};

export default compose(
  connect(
    (state: RootState) => ({
      pools: state.Midgard.pools,
      poolData: state.Midgard.poolData,
      stats: state.Midgard.stats,
      assets: state.Midgard.assets,
      poolLoading: state.Midgard.poolLoading,
      assetLoading: state.Midgard.assetLoading,
      poolDataLoading: state.Midgard.poolDataLoading,
      priceIndex: state.Midgard.priceIndex,
      txData: state.Midgard.txData,
      assetData: state.Wallet.assetData,
      user: state.Wallet.user,
    }),
    {
      getPools: midgardActions.getPools,
      getPoolAddress: midgardActions.getPoolAddress,
      getTransactions: midgardActions.getTransaction,
    },
  ),
  withRouter,
)(PoolView);

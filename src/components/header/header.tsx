import React, { useCallback, useEffect } from 'react';

import { connect } from 'react-redux';
import { useHistory, Link } from 'react-router-dom';

import { WalletOutlined } from '@ant-design/icons';
import * as RD from '@devexperts/remote-data-ts';
import { Alert, Grid, Popover } from 'antd';

import WalletDrawer from 'containers/WalletView/WalletDrawer';

import * as appActions from 'redux/app/actions';
import { MAX_VALUE } from 'redux/app/const';
import { TxStatus, TxResult, TxTypes } from 'redux/app/types';
import * as binanceActions from 'redux/binance/actions';
import { TransferEventRD } from 'redux/binance/types';
import { RootState } from 'redux/store';
import { User } from 'redux/wallet/types';

import useNetwork from 'hooks/useNetwork';

import { showTxFinishNotification } from 'helpers/notificationHelper';
import { getSymbolPair } from 'helpers/stringHelper';
import { withdrawResult, WithdrawResultParams } from 'helpers/utils/poolUtils';
import { getTxResult } from 'helpers/utils/swapUtils';
import { getBetaConfirm, saveBetaConfirm } from 'helpers/webStorageHelper';

import { Maybe, Nothing, Pair } from 'types/bepswap';

import { getNet, isMainnet } from '../../env';
import ConfirmModal from '../modals/confirmModal';
import Refresh from '../refresh';
import Label from '../uielements/label';
import Logo from '../uielements/logo';
import showNotification from '../uielements/notification';
import ThemeSwitch from '../uielements/themeSwitch';
import TxProgress from '../uielements/txProgress';
import WalletButton from '../uielements/walletButton';
import BasePriceSelector from './basePriceSelector';
import {
  StyledAlertWrapper,
  StyledHeader,
  LogoWrapper,
  HeaderActionButtons,
  HeaderCenterWrapper,
  PopoverContent,
  PopoverIcon,
  TooltipContent,
  HeaderLeft,
  HeaderLeftActions,
  TxIconButton,
} from './header.style';
import HeaderSetting from './headerSetting';

type ConnectedProps = {
  user: Maybe<User>;
  midgardBasePath: Maybe<string>;
  txStatus: TxStatus;
  txResult: Maybe<TxResult>;
  wsTransferEvent: TransferEventRD;
  getBEPSwapData: typeof appActions.getBEPSwapData;
  setTxTimerValue: typeof appActions.setTxTimerValue;
  countTxTimerValue: typeof appActions.countTxTimerValue;
  setTxTimerModal: typeof appActions.setTxTimerModal;
  setTxTimerStatus: typeof appActions.setTxTimerStatus;
  resetTxStatus: typeof appActions.resetTxStatus;
  setTxResult: typeof appActions.setTxResult;
  subscribeBinanceTransfers: typeof binanceActions.subscribeBinanceTransfers;
  unSubscribeBinanceTransfers: typeof binanceActions.unSubscribeBinanceTransfers;
};

type ComponentProps = {
  title: string;
};

type Props = ConnectedProps & ComponentProps;

const Header: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    user,
    midgardBasePath,
    txStatus,
    txResult,
    wsTransferEvent,
    getBEPSwapData,
    setTxTimerValue,
    countTxTimerValue,
    setTxTimerModal,
    setTxTimerStatus,
    resetTxStatus,
    setTxResult,
    subscribeBinanceTransfers,
    unSubscribeBinanceTransfers,
  } = props;
  const history = useHistory();
  const hasBetaConfirmed = getBetaConfirm();

  const { globalRuneStakeStatus, shortGlobalRuneStakeStatus } = useNetwork();
  const { isValidFundCaps } = useNetwork();

  const wallet: Maybe<string> = user ? user.wallet : Nothing;
  const { status, value, startTime, hash, info, type: txType } = txStatus;
  const isDesktopView = Grid.useBreakpoint()?.lg ?? true;

  // when the page loaded first time
  useEffect(() => {
    getBEPSwapData();
    if (wallet) {
      subscribeBinanceTransfers({ address: wallet, net: getNet() });
      return () => {
        unSubscribeBinanceTransfers();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when user wallet changes, subscribe Websocket again
  useEffect(() => {
    // subscribe again if another wallet has been added
    if (wallet) {
      unSubscribeBinanceTransfers();
      subscribeBinanceTransfers({ address: wallet, net: getNet() });
    }
  }, [wallet, subscribeBinanceTransfers, unSubscribeBinanceTransfers]);

  // wsTransferEvent has been updated
  useEffect(() => {
    const currentWsTransferEvent = RD.toNullable(wsTransferEvent);

    if (
      currentWsTransferEvent &&
      hash !== undefined &&
      txResult?.status === false &&
      wallet
    ) {
      const transferHash = currentWsTransferEvent?.data?.H;

      if (txType === TxTypes.SWAP && transferHash !== hash) {
        const pair: Pair = getSymbolPair(info);
        console.log('currentWsTransferEvent', currentWsTransferEvent);
        if (txStatus.status) {
          const txResultData = getTxResult({
            pair,
            tx: currentWsTransferEvent,
            address: wallet,
          });

          if (txResultData) {
            setTxResult({
              ...txResultData,
              status: true,
            });
          }
        }
      }
      if (txType === TxTypes.STAKE) {
        if (transferHash === hash) {
          // stake transfer detected from the binance
          // DO SOMETHING
        }
      }
      if (txType === TxTypes.WITHDRAW) {
        const withdrawTxRes = withdrawResult({
          tx: currentWsTransferEvent,
          symbol: info,
          address: wallet,
        } as WithdrawResultParams);

        // if withdraw hash has been detected, set tx status as TRUE
        if (withdrawTxRes) {
          setTxResult({
            status: true,
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [RD.toNullable(wsTransferEvent)]);

  const handleClickTxProgress = useCallback(() => {
    if (txStatus.type !== undefined) {
      setTxTimerModal(true);
    } else {
      history.push('/tx');
    }
  }, [setTxTimerModal, txStatus, history]);

  const handleChangeTxProgress = () => {
    const { value, type: txType, hash } = txStatus;
    if (txType === TxTypes.SWAP) {
      // Count handling depends on `txResult`
      // If tx has been confirmed, then we jump to last `valueIndex` ...
      if (txResult?.status && value < MAX_VALUE) {
        setTxTimerValue(MAX_VALUE);
      }
      // In other cases (no `txResult`) we don't jump to last `indexValue`...
      if (!txResult?.status) {
        // ..., but we are still counting
        if (value < 75) {
          // Add a quarter
          countTxTimerValue(25);
        } else if (value >= 75 && value < 95) {
          // With last quarter we just count a little bit to signalize still a progress
          countTxTimerValue(0.75);
        }
      }
    } else if (txType === TxTypes.WITHDRAW) {
      // If tx has been confirmed finally,
      // then we jump to last `valueIndex` ...
      if (txResult?.status && value < MAX_VALUE) {
        setTxTimerValue(MAX_VALUE);
      }
      // In other cases (no `txResult`) we don't jump to last `indexValue`...
      if (!txResult?.status) {
        // ..., but we are still counting
        if (value < 75) {
          // Add a quarter
          countTxTimerValue(25);
        } else if (value >= 75 && value < 95) {
          // With last quarter we just count a little bit to signalize still a progress
          countTxTimerValue(1);
        }
      }
    } else if (txType === TxTypes.STAKE) {
      // If tx has been sent successfully,
      // we jump to last `valueIndex` ...
      if (hash && value < MAX_VALUE) {
        setTxTimerValue(MAX_VALUE);
      }
      // In other cases (no `hash`) we don't jump to last `indexValue`...
      if (!hash) {
        // ..., but we are still counting
        if (value < 75) {
          // Add a quarter
          countTxTimerValue(25);
        } else if (value >= 75 && value < 95) {
          // With last quarter we just count a little bit to signalize still a progress
          countTxTimerValue(1);
        }
      }
    } else if (txType === TxTypes.CREATE) {
      // pool create tx
      countTxTimerValue(25);
    }
  };

  const handleEndTxProgress = () => {
    setTxTimerStatus(false);
    showTxFinishNotification(txStatus, txResult);
  };

  const handleCloseModal = () => {
    // hide modal
    setTxTimerModal(false);

    if (txType === TxTypes.CREATE) {
      showNotification({
        type: 'open',
        message: 'Pool Created Successfully!',
        description:
          'It may take a few moments until a new pool appears in the pool list!',
      });
    }
  };

  const handleFinishModal = () => {
    handleCloseModal();
    resetTxStatus();
  };

  const getPopupContainer = () => {
    return document.getElementsByClassName('stake-header')[0] as HTMLElement;
  };

  const renderPopoverContent = () => (
    <PopoverContent>
      A Funds Cap is currently in place as the protocol balances security and
      demand on ChaosNet. The cap maxes out at 95%. Please follow the project on
      Twitter @thorchain_org for announcements regarding cap raise.
    </PopoverContent>
  );

  const renderTxProgress = () => {
    return (
      <Popover
        content={<TooltipContent>View Transaction</TooltipContent>}
        getPopupContainer={getPopupContainer}
        placement="bottom"
        overlayStyle={{
          padding: '6px',
          animationDuration: '0s !important',
          animation: 'none !important',
        }}
      >
        <TxIconButton>
          <TxProgress
            status={status}
            value={value}
            maxValue={MAX_VALUE}
            maxSec={45}
            startTime={startTime}
            onClick={handleClickTxProgress}
            onChange={handleChangeTxProgress}
            onEnd={handleEndTxProgress}
          />
        </TxIconButton>
      </Popover>
    );
  };

  const renderHeader = (isDesktopView: boolean) => {
    if (isDesktopView) {
      return (
        <StyledHeader>
          <HeaderLeft>
            <LogoWrapper>
              <Link to="/pools">
                <Logo name="bepswap" type="long" />
              </Link>
            </LogoWrapper>
            <HeaderLeftActions>
              <HeaderSetting midgardBasePath={midgardBasePath} />
              <ThemeSwitch />
            </HeaderLeftActions>
          </HeaderLeft>
          <HeaderCenterWrapper className="stake-header">
            <Label>
              {globalRuneStakeStatus}{' '}
              {!isValidFundCaps && '(Funds Cap Reached)'}
            </Label>
            {!isValidFundCaps && (
              <Popover
                content={renderPopoverContent}
                getPopupContainer={getPopupContainer}
                placement="bottomRight"
                overlayClassName="stake-header-info"
                overlayStyle={{
                  padding: '6px',
                  animationDuration: '0s !important',
                  animation: 'none !important',
                }}
              >
                <PopoverIcon />
              </Popover>
            )}
          </HeaderCenterWrapper>
          <HeaderActionButtons>
            <BasePriceSelector />
            {renderTxProgress()}
            {!wallet && (
              <Link to="/connect">
                <WalletButton
                  data-test="add-wallet-button"
                  connected={false}
                  address={wallet}
                />
              </Link>
            )}
            {wallet && <WalletDrawer />}
            <Refresh />
          </HeaderActionButtons>
          <ConfirmModal
            txStatus={txStatus}
            txResult={txResult || {}}
            onClose={handleCloseModal}
            onFinish={handleFinishModal}
          />
        </StyledHeader>
      );
    }
    return (
      <>
        <StyledHeader>
          <LogoWrapper>
            <Link to="/pools">
              <Logo name="bepswap" type="normal" />
            </Link>
          </LogoWrapper>
          <HeaderCenterWrapper>
            <Label weight="bold">
              {shortGlobalRuneStakeStatus}{' '}
              {!isValidFundCaps && '(Funds Cap Reached)'}
            </Label>
          </HeaderCenterWrapper>
          <HeaderActionButtons>
            <BasePriceSelector />
            <ThemeSwitch />
            {wallet && (
              <TxProgress
                status={status}
                value={value}
                maxValue={MAX_VALUE}
                maxSec={45}
                startTime={startTime}
                onClick={handleClickTxProgress}
                onChange={handleChangeTxProgress}
                onEnd={handleEndTxProgress}
              />
            )}
            {!wallet && (
              <Link to="/connect">
                <WalletButton
                  data-test="add-wallet-button"
                  connected={false}
                  address={wallet}
                />
              </Link>
            )}
            {!wallet && (
              <Link to="/connect">
                <div className="wallet-mobile-btn">
                  <WalletOutlined />
                </div>
              </Link>
            )}
            {wallet && <WalletDrawer />}
            <Refresh />
          </HeaderActionButtons>
          <ConfirmModal
            txStatus={txStatus}
            txResult={txResult || {}}
            onClose={handleCloseModal}
            onFinish={handleFinishModal}
          />
        </StyledHeader>
      </>
    );
  };

  return (
    <>
      {isMainnet && !hasBetaConfirmed && (
        <StyledAlertWrapper>
          <Alert
            message="Warning"
            description="This product is in beta. Do not add liquidity or swap large amounts of funds."
            showIcon
            closable
            type="warning"
            onClose={() => saveBetaConfirm(true)}
          />
        </StyledAlertWrapper>
      )}
      {renderHeader(isDesktopView)}
    </>
  );
};

export default connect(
  (state: RootState) => ({
    txResult: state.App.txResult,
    txStatus: state.App.txStatus,
    user: state.Wallet.user,
    midgardBasePath: RD.toNullable(state.Midgard.apiBasePath),
    wsTransferEvent: state.Binance.wsTransferEvent,
  }),
  {
    getBEPSwapData: appActions.getBEPSwapData,
    setTxResult: appActions.setTxResult,
    setTxTimerValue: appActions.setTxTimerValue,
    countTxTimerValue: appActions.countTxTimerValue,
    setTxTimerModal: appActions.setTxTimerModal,
    setTxTimerStatus: appActions.setTxTimerStatus,
    resetTxStatus: appActions.resetTxStatus,
    subscribeBinanceTransfers: binanceActions.subscribeBinanceTransfers,
    unSubscribeBinanceTransfers: binanceActions.unSubscribeBinanceTransfers,
  },
)(Header);

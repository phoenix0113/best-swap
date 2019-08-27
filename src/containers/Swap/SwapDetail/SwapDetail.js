import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Row, Col, Icon } from 'antd';

import Button from '../../../components/uielements/button';
import Drag from '../../../components/uielements/drag';
import CoinCard from '../../../components/uielements/coins/coinCard';
import CoinList from '../../../components/uielements/coins/coinList';
import Label from '../../../components/uielements/label';
import Input from '../../../components/uielements/input/input';
import Modal from '../../../components/uielements/modal';

import { ContentWrapper } from './SwapDetail.style';

import { blackArrowIcon } from '../../../components/icons';

import { assetsData } from './data';

class SwapDetail extends Component {
  static propTypes = {
    info: PropTypes.string,
    view: PropTypes.string.isRequired,
  };

  static defaultProps = {
    info: '',
    dragReset: true,
    openSwapModal: false,
  };

  state = {};

  handleDrag = () => {
    this.setState({
      dragReset: false,
    });
  };

  handleEndDrag = () => {
    this.setState({
      openSwapModal: true,
    });
  };

  handleConfirmSwap = () => {
    this.handleCloseModal();
  };

  handleCloseModal = () => {
    this.setState({
      dragReset: true,
      openSwapModal: false,
    });
  };

  handleGotoDetail = () => {
    const { info } = this.props;
    const URL = `/swap/detail/${info}`;

    this.props.history.push(URL);
  };

  handleGotoSend = () => {
    const { info } = this.props;
    const URL = `/swap/send/${info}`;

    this.props.history.push(URL);
  };

  handleSelectTraget = targetIndex => {
    const { view } = this.props;
    const { source } = this.getSwapData();
    const target = assetsData[targetIndex].asset;
    const URL = `/swap/${view}/${source}-${target}`;

    this.props.history.push(URL);
  };

  getSwapData = () => {
    const { info } = this.props;

    if (info) {
      const source = info.split('-')[0];
      const target = info.split('-')[1];

      return {
        source,
        target,
      };
    }
    return {};
  };

  render() {
    const { view } = this.props;
    const { openSwapModal, dragReset } = this.state;

    const swapData = this.getSwapData();

    if (!swapData) {
      return '';
    }

    const { source, target } = swapData;
    const targetIndex = assetsData.findIndex(value => value.asset === target);

    const dragTitle =
      view === 'detail' ? 'Drag to swap' : 'Drag to swap and send';

    return (
      <ContentWrapper className="swap-detail-wrapper">
        <Row>
          <Col className="swap-detail-panel" span={16}>
            <div className="swap-type-selector">
              <Button
                onClick={this.handleGotoDetail}
                sizevalue="big"
                typevalue="ghost"
                focused={view === 'detail'}
              >
                swap
              </Button>
              <Button
                onClick={this.handleGotoSend}
                sizevalue="big"
                typevalue="ghost"
                focused={view === 'send'}
              >
                swap & send
              </Button>
            </div>
            {view === 'send' && (
              <div className="recipient-form">
                <Label weight="bold">Recipient Address:</Label>
                <Input placeholder="bnbeh456..." sizevalue="normal" />
              </div>
            )}
            <div className="swap-asset-card">
              <CoinCard
                title="You are swapping"
                asset={source}
                amount={1.354}
                price={600}
                withSelection
              />
              <img src={blackArrowIcon} alt="blackarrow-icon" />
              <CoinCard
                title="You will receive"
                asset={target}
                amount={13549}
                price={596}
                slip={2}
              />
            </div>
            <div className="drag-confirm-wrapper">
              <Drag
                title={dragTitle}
                source={source}
                target={target}
                reset={dragReset}
                onConfirm={this.handleEndDrag}
                onDrag={this.handleDrag}
              />
            </div>
          </Col>
          <Col className="swap-token-panel" span={8}>
            <Label className="select-token-label">
              Select token to receive
            </Label>
            <Input
              className="token-search-input"
              placeholder="Search Token ..."
              suffix={<Icon type="search" />}
            />
            <CoinList
              data={assetsData}
              value={targetIndex}
              onSelect={this.handleSelectTraget}
            />
          </Col>
        </Row>
        <Modal
          title="Swap"
          visible={openSwapModal}
          onOk={this.handleConfirmSwap}
          onCancel={this.handleCloseModal}
          okText="Swap"
        >
          <span>Do you want to Swap?</span>
        </Modal>
      </ContentWrapper>
    );
  }
}

export default withRouter(SwapDetail);

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Label from '../../../components/uielements/label';
import AddIcon from '../../../components/uielements/addIcon';
import PoolCard from '../../../components/pool/poolCard';

import ChainService from '../../../clients/chainservice';
import StateChain from '../../../clients/statechain';
import { ContentWrapper } from './PoolView.style';

class PoolView extends Component {
  state = {
    activeAsset: 'rune',
  };

  constructor(props) {
    super(props);

    this.refreshPools();
  }

  refreshPools = () => {
    StateChain.listPools()
      .then(async response => {
        const pools = await Promise.all(
          response.data.map(async pool => {
            return await ChainService.getPool(pool.ticker)
              .then(response => {
                const data = response.data;
                console.log('pool data', data);
                return {
                  target: pool.ticker.toLowerCase(),
                  depth: data.depth,
                  volume: data.vol24hr,
                  transaction: data.numStakeTx + data.numSwaps,
                  roi: data.roiAT,
                  liq: 1, // TODO: what is number suppose to be??
                  asset: 'rune',
                };
              })
              .catch(error => {
                console.error(error);
              });
          }),
        );
        this.setState({ pools: pools });
      })
      .catch(error => {
        console.error(error);
      });
  };

  handleStake = (source, target) => () => {
    const URL = `/pool/stake-new/${source}-${target}`;

    this.props.history.push(URL);
  };

  handleNewPool = () => {
    const URL = '/pool/new/rune';

    this.props.history.push(URL);
  };

  renderPoolList = () => {
    const { activeAsset } = this.state;
    console.log('Pools:', this.state.pools);

    return (this.state.pools || []).map((asset, index) => {
      if (asset !== activeAsset) {
        return (
          <PoolCard
            className="pool-card"
            asset={asset.asset}
            target={asset.target}
            depth={asset.depth}
            volume={asset.volume}
            transaction={asset.transaction}
            liq={asset.liq}
            roi={asset.roi}
            onStake={this.handleStake(activeAsset, asset)}
            key={index}
          />
        );
      }
    });
  };

  render() {
    return (
      <ContentWrapper className="pool-view-wrapper">
        <div className="pool-list-view">{this.renderPoolList()}</div>
        <div className="add-new-pool" onClick={this.handleNewPool}>
          <AddIcon />
          <Label size="normal" weight="bold" color="normal">
            ADD NEW POOL
          </Label>
        </div>
      </ContentWrapper>
    );
  }
}

export default withRouter(PoolView);

import React from 'react';
import { AssetInfoWrapper } from './assetInfo.style';

import Coin from '../../coins/coin';
import { CoinSize } from '../../coins/coin/types';

type Props = {
  asset: string;
  size?: CoinSize;
  className?: string;
};

const AssetInfo: React.FC<Props> = (props: Props): JSX.Element => {
  const { asset, size = 'small', className = '', ...otherProps } = props;

  return (
    <AssetInfoWrapper
      className={`assetInfo-wrapper ${className}`}
      {...otherProps}
    >
      <Coin className="asset-avatar" type={asset} size={size} />
      <div className="asset-label">{asset}</div>
    </AssetInfoWrapper>
  );
};

export default AssetInfo;

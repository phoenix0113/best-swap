import React from 'react';
import { storiesOf } from '@storybook/react';
import { ThemeProvider } from 'styled-components';

import AppHolder from '../../../../AppStyle';
import { defaultTheme } from '../../../../settings';

import TokenData from './tokenData';

const priceUnit = 'RUNE';

storiesOf('Components/Tokens/TokenData', module).add('default', () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <AppHolder>
        <div
          style={{ display: 'flex', flexDirection: 'column', width: '300px' }}
        >
          <TokenData asset="bnb" price={217.92} priceUnit={priceUnit} />
          <TokenData
            asset="bnb"
            assetValue={2.49274}
            priceValue="217.92"
            priceUnit={priceUnit}
          />
          <TokenData
            asset="ftm"
            assetValue={2.49274}
            priceValue="217.92"
            priceUnit={priceUnit}
          />
          <TokenData
            asset="rune"
            assetValue={2.49274}
            priceValue="217.92"
            priceUnit={priceUnit}
          />
          <TokenData
            asset="ankr"
            assetValue={2.49274}
            priceValue="217.92"
            priceUnit={priceUnit}
          />
          <TokenData
            asset="bolt"
            assetValue={2.49274}
            priceValue="217.92"
            priceUnit={priceUnit}
          />
          <TokenData
            asset="tomo"
            assetValue={2.49274}
            priceValue="217.92"
            priceUnit={priceUnit}
          />
        </div>
      </AppHolder>
    </ThemeProvider>
  );
});

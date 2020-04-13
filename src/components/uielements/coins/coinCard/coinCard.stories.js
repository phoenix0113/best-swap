import React from 'react';
import { storiesOf } from '@storybook/react';
import { ThemeProvider } from 'styled-components';

import { bn } from '@thorchain/asgardex-util';
import AppHolder from '../../../../AppStyle';
import { defaultTheme } from '../../../../settings';

import CoinCard from './coinCard';

storiesOf('Components/Coins/CoinCard', module).add('default', () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <AppHolder>
        <div style={{ display: 'flex', padding: '20px' }}>
          <CoinCard
            title="You are swapping"
            asset="bnb"
            assetData={[
              {
                asset: 'rune',
              },
              {
                asset: 'tomo',
              },
              {
                asset: 'tomo',
              },
            ]}
            amount={bn(1.354)}
            price={bn(600)}
            priceIndex={{
              RUNE: 1,
            }}
            withSelection
          />
          <CoinCard
            title="You will receive"
            asset="bolt"
            amount={bn(13549)}
            price={bn(596)}
            slip={2}
          />
        </div>
      </AppHolder>
    </ThemeProvider>
  );
});

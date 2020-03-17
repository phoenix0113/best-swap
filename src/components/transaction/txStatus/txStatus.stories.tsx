import React from 'react';
import { storiesOf } from '@storybook/react';
import { ThemeProvider } from 'styled-components';

import AppHolder from '../../../AppStyle';
import { defaultTheme } from '../../../settings';
import TxStatus, { Props } from './txStatus';

storiesOf('Components/Transaction/TxStatus', module).add('default', () => {
  const inTxDetail: Props = {
    type: 'in',
    data: [
      {
        asset: 'rune',
        amount: '1.25',
      },
    ],
    round: 'left',
  };
  const outTxDetail: Props = {
    type: 'out',
    data: [
      {
        asset: 'rune',
        amount: '1.25',
      },
      {
        asset: 'bnb',
        amount: '12.5',
      },
    ],
    round: 'right',
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <AppHolder>
        <div style={{ display: 'flex', padding: '20px' }}>
          <TxStatus {...inTxDetail} />
          <div style={{ margin: '0 10px' }} />
          <TxStatus {...outTxDetail} />
        </div>
      </AppHolder>
    </ThemeProvider>
  );
});

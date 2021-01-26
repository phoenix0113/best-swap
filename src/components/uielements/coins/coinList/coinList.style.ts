import styled from 'styled-components';
import { palette } from 'styled-theme';

import { transition } from 'settings/style-util';

export type CoinListWrapperSize = 'small' | 'big';

type CoinListWrapperProps = {
  size: CoinListWrapperSize;
};

export const CoinListWrapper = styled.div`
  display: flex;
  flex-direction: column;

  .coinList-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: ${(props: CoinListWrapperProps) =>
      props.size === 'small' ? '54px' : '74px'};
    padding: 0 20px;
    background-color: ${palette('background', 1)};
    cursor: pointer;
    ${transition()};

    &.active,
    &:hover {
      background-color: ${palette('secondary', 1)};
    }
  }
`;

export const StyledLink = styled.a`
  margin-left: 12px;
`;

export const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  height: 100%;

  .ant-btn {
    &:first-child {
      margin-top: -4px;
      margin-bottom: 4px;
    }
  }
`;

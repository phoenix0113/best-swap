import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Menu as AntdMenu } from 'antd';

export const CoinCardWrapper = styled.div`
  .title-label {
    font-style: italic;
  }
  .card-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    min-width: 250px;
    height: 85px;
    padding: 10px 10px;
    border: 1px solid ${palette('border', 0)};
    border-radius: 5px;
    background-color: #fff;

    .asset-data {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      padding: 10px 20px;

      .asset-amount-label {
        &.ant-input-number {
          border: none;
          input {
            padding: 0;
          }
        }

        &.ant-input-number-disabled {
          background-color: #fff;
        }
      }
      .ant-divider {
        margin: 2px 0;
      }

      .label-wrapper {
        padding: 0;
      }

      .asset-name-label {
        text-transform: uppercase;
        padding-bottom: 5px;
      }

      .asset-card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }

  .selection-wrapper {
    min-width: 250px;
    width: auto;
    margin-top: 10px;

    .btn-wrapper {
      width: 20%;
    }
  }

  .dropdown-icon {
    font-size: 18px;
  }
`;

export const Menu = styled(AntdMenu)`
  /* position: absolute;
  width: 276px;
  top: 32px;
  left: -250px; */
`;

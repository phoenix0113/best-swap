import React, { useMemo } from 'react';

import { match, withRouter, useLocation, useHistory } from 'react-router-dom';

import { LeftOutlined } from '@ant-design/icons';

import Footer from 'components/footer';
import Header from 'components/header';
import { IconButton } from 'components/IconButton';
import ViewPanel from 'components/viewPanel';

import useMidgard from 'hooks/useMidgard';

import { COMMIT_HASH } from 'helpers/envHelper';
import { matchPage, matchParam } from 'helpers/routerHelper';

import { RUNE_SYMBOL } from 'settings/assetData';

import { ContentWrapper, BackLink } from './App.style';
import AppLayout from './AppLayout';
import AppRouter from './AppRouter';

type Props = {
  match: match;
};

const App: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    match: { url },
  } = props;

  const location = useLocation();
  const history = useHistory();
  const { isValidPool } = useMidgard();

  const renderBack = useMemo(() => {
    const { pathname } = location;
    if (matchPage.isHomePage(pathname)) {
      return <></>;
    }

    const handleGoBack = () => {
      if (matchPage.isAddLiquidityPage(pathname)) {
        const symbol = matchParam.matchAddLiquiditySymbol(pathname);

        if (symbol && isValidPool(symbol)) {
          history.push(`/pool/${symbol}`);
        } else {
          history.push('/pools');
        }
      } else if (matchPage.isSwapPage(pathname)) {
        const symbolPair = matchParam.matchSwapDetailPair(pathname);
        const source = symbolPair?.source;
        const target = symbolPair?.target;

        if (source !== RUNE_SYMBOL) {
          history.push(`/pool/${source}`);
        } else if (target !== RUNE_SYMBOL) {
          history.push(`/pool/${target}`);
        }
      } else {
        history.push('/pools');
      }
    };

    return (
      <BackLink
        onClick={handleGoBack}
      >
        <IconButton>
          <LeftOutlined />
          <span>Back</span>
        </IconButton>
      </BackLink>
    );
  }, [location, history, isValidPool]);

  return (
    <AppLayout>
      <Header title="SWAP AND ADD BEP2 ASSETS" />
      <ContentWrapper>
        <ViewPanel>
          {renderBack}
          <AppRouter url={url} />
        </ViewPanel>
      </ContentWrapper>
      <Footer commitHash={COMMIT_HASH} />
    </AppLayout>
  );
};

export default withRouter(App);

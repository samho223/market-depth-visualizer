import React, { FunctionComponent } from 'react';
import { Container } from "./styles";
import { MOBILE_WIDTH } from "../../../constants";

interface TitleRowProps {
  reversedFieldsOrder?: boolean;
  windowWidth: number;
}

const TitleRow: FunctionComponent<TitleRowProps> = ({reversedFieldsOrder = false, windowWidth}) => {
  return (
    <Container data-testid='title-row'>
      {/* oreder of title is changed if window size is reduced lower than MOBILE_WIDTH */}
      {reversedFieldsOrder || windowWidth < MOBILE_WIDTH ?
        <>
          <span>PRICE</span>
          <span>SIZE</span>
          <span>TOTAL</span>
        </> :
        <>
          <span>TOTAL</span>
          <span>SIZE</span>
          <span>PRICE</span>
        </>}
    </Container>
  );
};

export default TitleRow;

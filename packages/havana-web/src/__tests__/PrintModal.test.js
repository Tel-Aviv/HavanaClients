import './matchMedia.mock';

import React from 'react';
import renderer from 'react-test-renderer';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import i18n from 'i18next';
import { initReactI18next } from "react-i18next";
import translations from '../translations';

import { DataContext } from '../DataContext';
import PrintModal from '../PrintModal';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: translations,
    lng: "he",
    debug: false
  })

describe('PrintModal', () => {

    const context = {
        user: 'אולג קליימן',
    }

    const cancelFn = jest.fn();

    const printModalComponent = 
        <DataContext.Provider value={context}>
          <PrintModal visible={true}
              closed={cancelFn}
              month={10}
              year={2020}
              signature={null}
              totals={160.37}>
                <div>Dummy</div>
          </PrintModal>
        </DataContext.Provider>

    // const printModalComponent = <ReportContext.Provider value={ {
    //                                 codes: []
    //                             }
    //                             }>
    //         <AddRecordModal />
    //     </ReportContext.Provider>

    beforeAll( () => {
        jest.resetModules()
    })     
    test('Layout Snap', () => {

        // const component = renderer.create(printModalComponent);

        // let tree = component.toJSON();
        // expect(tree).toMatchSnapshot();

    })

    // test('Test functionality (@testing-library)', () => {
    //     render(printModalComponent)
        
    //     const printButtonElement = screen.getByLabelText('print');
    //     expect(printButtonElement).toBeInTheDocument();
    //     fireEvent(printButtonElement, new MouseEvent('click', {
    //         bubbles: true,
    //         cancelable: true,
    //     }));        
    // })
})
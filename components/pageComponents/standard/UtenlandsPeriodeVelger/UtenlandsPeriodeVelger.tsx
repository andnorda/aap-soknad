import React, { useEffect, useMemo } from 'react';
const { eeaMember } = require('is-european');
import { FieldValues, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as classes from './UtenlandsPeriode.module.css';
import {
  Label,
  BodyShort,
  BodyLong,
  Button,
  Heading,
  Ingress,
  Modal,
  Radio,
  Cell,
  Grid,
} from '@navikt/ds-react';
import { JaEllerNei } from 'types/Generic';
import RadioGroupWrapper from 'components/input/RadioGroupWrapper/RadioGroupWrapper';
import CountrySelector from 'components/input/CountrySelector';
import TextFieldWrapper from 'components/input/TextFieldWrapper';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { ModalButtonWrapper } from 'components/ButtonWrapper/ModalButtonWrapper';
import { UtenlandsPeriode } from 'types/Soknad';
import { formatDate } from 'utils/date';
import { MonthPickerWrapper } from 'components/input/MonthPickerWrapper/MonthPickerWrapper';
import { subYears } from 'date-fns';

export enum ArbeidEllerBodd {
  ARBEID = 'ARBEID',
  BODD = 'BODD',
}
interface UtenlandsPeriodeProps {
  utenlandsPeriode?: UtenlandsPeriode;
  onSave: (data: any) => void;
  onCancel: () => void;
  onClose: () => void;
  open: boolean;
  arbeidEllerBodd: ArbeidEllerBodd;
}
const initFieldVals: FieldValues = {
  land: '',
  fraDato: undefined,
  tilDato: undefined,
  iArbeid: false,
};
const UtenlandsPeriodeVelger = ({
  utenlandsPeriode,
  onSave,
  onCancel,
  onClose,
  open,
  arbeidEllerBodd,
}: UtenlandsPeriodeProps) => {
  const { formatMessage } = useFeatureToggleIntl();

  const schema = yup.object().shape({
    arbeidEllerBodd: yup.string().nullable(),
    land: yup
      .string()
      .required(formatMessage('søknad.medlemskap.utenlandsperiode.modal.land.validation.required'))
      .notOneOf(
        ['none'],
        formatMessage('søknad.medlemskap.utenlandsperiode.modal.land.validation.required')
      ),
    fraDato: yup
      .date()
      .required(
        formatMessage(
          'søknad.medlemskap.utenlandsperiode.modal.periode.fraDato.validation.required'
        )
      ),
    tilDato: yup
      .date()
      .required(
        formatMessage(
          'søknad.medlemskap.utenlandsperiode.modal.periode.tilDato.validation.required'
        )
      )
      .min(
        yup.ref('fraDato'),
        formatMessage(
          'søknad.medlemskap.utenlandsperiode.modal.periode.tilDato.validation.fraDatoEtterTilDato'
        )
      ),
    iArbeid: yup.string().when('arbeidEllerBodd', {
      is: ArbeidEllerBodd.BODD,
      then: yup
        .string()
        .required(
          formatMessage('søknad.medlemskap.utenlandsperiode.modal.iArbeid.validation.required')
        )
        .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
        .nullable(),
    }),
  });

  const {
    control,
    watch,
    formState: { errors },
    reset,
    handleSubmit,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...(utenlandsPeriode
        ? {
            ...utenlandsPeriode,
            fraDato: formatDate(utenlandsPeriode.fraDato, 'yyyy-MM-dd'),
            tilDato: formatDate(utenlandsPeriode.tilDato, 'yyyy-MM-dd'),
            arbeidEllerBodd: arbeidEllerBodd,
          }
        : { ...initFieldVals, arbeidEllerBodd: arbeidEllerBodd }),
    },
  });

  useEffect(() => {
    reset({
      ...utenlandsPeriode,
      fraDato: formatDate(utenlandsPeriode?.fraDato, 'yyyy-MM-dd'),
      tilDato: formatDate(utenlandsPeriode?.tilDato, 'yyyy-MM-dd'),
      arbeidEllerBodd: arbeidEllerBodd,
    });
  }, [utenlandsPeriode, arbeidEllerBodd, open, reset]);

  const antallÅrTilbake = arbeidEllerBodd === ArbeidEllerBodd.ARBEID ? 5 : 60;

  const valgtLand = watch('land');
  const showUtenlandsId = useMemo(() => {
    const landKode = valgtLand?.split(':')?.[0];
    return (
      landKode === 'GB' ||
      landKode === 'CH' ||
      landKode === 'IM' ||
      landKode === 'JE' ||
      eeaMember(landKode)
    );
  }, [valgtLand]);
  const clearModal = () => {
    setValue('land', '');
    setValue('fraDato', undefined);
    setValue('tilDato', undefined);
    setValue('iArbeid', undefined);
    setValue('utenlandsId', '');
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Content className={classes.utenlandsPeriodeVelger}>
        <Heading size={'medium'} level={'2'} spacing>
          {formatMessage(`søknad.medlemskap.utenlandsperiode.modal.title.${arbeidEllerBodd}`)}
        </Heading>
        <BodyLong spacing={!(arbeidEllerBodd === 'BODD')}>
          {formatMessage(`søknad.medlemskap.utenlandsperiode.modal.ingress.${arbeidEllerBodd}`)}
        </BodyLong>
        {arbeidEllerBodd === 'BODD' && (
          <BodyLong spacing>
            {formatMessage(`søknad.medlemskap.utenlandsperiode.modal.ingress.${arbeidEllerBodd}_2`)}
          </BodyLong>
        )}
        <form
          className={classes.modalForm}
          onSubmit={handleSubmit((data) => {
            onSave(data);
            clearModal();
          })}
        >
          <CountrySelector
            className={classes.countrySelector}
            name={'land'}
            label={formatMessage(
              `søknad.medlemskap.utenlandsperiode.modal.land.label.${arbeidEllerBodd}`
            )}
            control={control}
            error={errors?.land?.message}
          />
          <div>
            <Label>
              {formatMessage(
                `søknad.medlemskap.utenlandsperiode.modal.periode.label.${arbeidEllerBodd}`
              )}
            </Label>
            <Grid>
              <Cell xs={12} lg={5}>
                <MonthPickerWrapper
                  name="fraDato"
                  selectedDate={utenlandsPeriode?.fraDato}
                  setValue={setValue}
                  label={formatMessage(
                    'søknad.medlemskap.utenlandsperiode.modal.periode.fraDato.label'
                  )}
                  fromDate={subYears(new Date(), antallÅrTilbake)}
                  toDate={new Date()}
                  error={errors?.fraDato?.message}
                />
              </Cell>
              <Cell xs={12} lg={5}>
                <MonthPickerWrapper
                  name="tilDato"
                  selectedDate={utenlandsPeriode?.tilDato}
                  setValue={setValue}
                  label={formatMessage(
                    'søknad.medlemskap.utenlandsperiode.modal.periode.tilDato.label'
                  )}
                  fromDate={subYears(new Date(), antallÅrTilbake)}
                  toDate={new Date()}
                  error={errors?.tilDato?.message}
                />
              </Cell>
            </Grid>
          </div>
          {arbeidEllerBodd === ArbeidEllerBodd.BODD && (
            <RadioGroupWrapper
              name={'iArbeid'}
              legend={formatMessage('søknad.medlemskap.utenlandsperiode.modal.iArbeid.label')}
              control={control}
              error={errors?.iArbeid?.message}
            >
              <Radio value={JaEllerNei.JA}>
                <BodyShort>Ja</BodyShort>
              </Radio>
              <Radio value={JaEllerNei.NEI}>
                <BodyShort>Nei</BodyShort>
              </Radio>
            </RadioGroupWrapper>
          )}
          {showUtenlandsId && (
            <TextFieldWrapper
              className={classes.pidInput}
              name={'utenlandsId'}
              label={formatMessage('søknad.medlemskap.utenlandsperiode.modal.utenlandsId.label')}
              control={control}
            />
          )}
          <ModalButtonWrapper>
            <Button
              type="button"
              variant={'secondary'}
              onClick={() => {
                clearModal();
                onCancel();
              }}
            >
              {formatMessage('søknad.medlemskap.utenlandsperiode.modal.buttons.avbryt')}
            </Button>

            <Button>
              {formatMessage('søknad.medlemskap.utenlandsperiode.modal.buttons.lagre')}
            </Button>
          </ModalButtonWrapper>
        </form>
      </Modal.Content>
    </Modal>
  );
};
export default UtenlandsPeriodeVelger;

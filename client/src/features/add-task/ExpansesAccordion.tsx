import React from 'react';
import {
  Box, Typography, IconButton, Button, TextField,
  Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { useOptionsStore } from '@entities/options/store';
import { CURRENCIES } from '@entities/options/currencies';
import type { ChecklistItem } from '@shared/types';

interface ExpansesAccordionProps {
  mode: 'create' | 'view';
  items: ChecklistItem[];
  onUpdateAmount: (idx: number, amount: number | undefined) => void;
  onRemove: (idx: number) => void;
  onAddClick: () => void;
}

export const ExpansesAccordion: React.FC<ExpansesAccordionProps> = ({
  mode, items, onUpdateAmount, onRemove, onAddClick,
}) => {
  const showAmountInputs = mode === 'view';
  const currencyCode = useOptionsStore((s) => s.currency);
  const currency = CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0];
  const total = items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const formattedTotal = total % 1 === 0 ? total : total.toFixed(2);

  return (
    <Accordion defaultExpanded={false} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px !important', mb: 1.5, '&::before': { display: 'none' } }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
        sx={{ minHeight: 44, px: 2, '& .MuiAccordionSummary-content': { my: 0.75 } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Expanses
          </Typography>
          {total > 0 && (
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 'auto', pr: 1 }}>
              {currency.symbol}{formattedTotal}
            </Typography>
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {items.map((item, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body2"
                noWrap
                sx={{ flex: 1, fontSize: '0.875rem', color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}
              >
                {item.text}
              </Typography>
              {showAmountInputs && (
                <TextField
                  type="number"
                  value={item.amount || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onUpdateAmount(idx, isNaN(val) ? undefined : val);
                  }}
                  placeholder="0"
                  size="small"
                  variant="outlined"
                  inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right', fontSize: '0.875rem', padding: '4px 8px', MozAppearance: 'textfield' } }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': { WebkitAppearance: 'none' },
                  }}
                />
              )}
              <IconButton
                size="small"
                onClick={() => onRemove(idx)}
                sx={{ color: 'primary.main', flexShrink: 0, '&:hover': { opacity: 0.7, background: 'transparent' } }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Box>
          ))}
        </Box>

        <Button
          startIcon={<AddIcon sx={{ fontSize: 15 }} />}
          onClick={onAddClick}
          size="small"
          sx={{ color: 'primary.main', fontWeight: 500, px: 0.5, mt: items.length > 0 ? 0.75 : 0, '&:hover': { background: 'transparent', opacity: 0.8 } }}
        >
          Add expanse
        </Button>
      </AccordionDetails>
    </Accordion>
  );
};

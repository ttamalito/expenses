package com.api.expenses.rest.controllers;

import com.api.expenses.rest.models.Currency;
import com.api.expenses.rest.models.dtos.CreateCurrencyDto;
import com.api.expenses.rest.models.dtos.GetCurrencyDto;
import com.api.expenses.rest.services.CurrencyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/currency", produces = {MediaType.APPLICATION_JSON_VALUE})
public class CurrencyController {

    private final CurrencyService currencyService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public CurrencyController(CurrencyService currencyService) {
        this.currencyService = currencyService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<GetCurrencyDto>> getAllCurrencies() {
        List<Currency> currencies = currencyService.getAllCurrencies();
        List<GetCurrencyDto> currencyDtos = currencies.stream()
                .map(currency -> new GetCurrencyDto(
                        currency.getId(),
                        currency.getName(),
                        currency.getSymbol(),
                        currency.getCode()))
                .collect(Collectors.toList());
        return ResponseEntity.ok().body(currencyDtos);

    }

    @GetMapping("/{currencyId}")
    public ResponseEntity<GetCurrencyDto> getCurrency(@PathVariable int currencyId) {
        Optional<Currency> optionalCurrency = currencyService.getCurrencyById(currencyId);
        if (optionalCurrency.isPresent()) {
            Currency currency = optionalCurrency.get();
            GetCurrencyDto currencyDto = new GetCurrencyDto(
                    currency.getId(),
                    currency.getName(),
                    currency.getSymbol(),
                    currency.getCode());
            return ResponseEntity.ok().body(currencyDto);
        }
        return ResponseEntity.notFound().build();

    }

    @PostMapping("/create")
    public ResponseEntity<GetCurrencyDto> createCurrency(@RequestBody CreateCurrencyDto createCurrencyDto) {

        Currency currency = currencyService.createCurrency(createCurrencyDto);
        GetCurrencyDto currencyDto = new GetCurrencyDto(
                currency.getId(),
                currency.getName(),
                currency.getSymbol(),
                currency.getCode());
        return ResponseEntity.ok().body(currencyDto);

    }

    @DeleteMapping("/delete/{currencyId}")
    public ResponseEntity<Void> deleteCurrency(@PathVariable int currencyId) {
        currencyService.deleteCurrency(currencyId);
        return ResponseEntity.noContent().build();
    }
}
package com.api.expenses.rest.services;

import com.api.expenses.rest.models.Currency;
import com.api.expenses.rest.models.ExpenseCategory;
import com.api.expenses.rest.models.Role;
import com.api.expenses.rest.models.User;
import com.api.expenses.rest.repositories.CurrencyRepository;
import com.api.expenses.rest.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Primary
@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final ExpenseCategoryService expenseCategoryService;
    private final CurrencyRepository currencyRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository,
                       ExpenseCategoryService expenseCategoryService,
                       CurrencyRepository currencyRepository, @Lazy PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.expenseCategoryService = expenseCategoryService;
        this.currencyRepository = currencyRepository;
        this.passwordEncoder = passwordEncoder;
    }


    /**
     * Creates a new user, by encoding the password and saving the user to the database
     * @param username
     * @param password
     * @param email
     * @param currencyId
     * @param role
     * @throws RuntimeException if the currency with the given id is not found
     * @return the id of the created user
     */
    public UUID createUser(
            String username,
            String password,
            String email,
            int currencyId,
            Role role) {

        Currency currency = getCurrencyById(currencyId);

        String encodedPassword = passwordEncoder.encode(password);

        User user = new User(
                username,
                encodedPassword,
                email,
                role,
                currency,
                "profilePicture"
        );

       User savedUser =  userRepository.save(user);
       return savedUser.getId();
    }

    /**
     * Authenticates a user by checking if the username exists and the password matches
     * @param username
     * @param password
     * @return true if the user has been successfully authenticated, false otherwise
     */
    public Optional<User> authenticateUserByUsername(String username, String password) {
        Optional<User> user = userRepository.findByUsername(username);
        return user.isPresent() && passwordEncoder.matches(password, user.get().getPassword()) ? user : Optional.empty();
    }

    /**
     * Authenticates a user by checking if the email exists and the password matches
     * @param email
     * @param password
     * @return
     */
    public Optional<User> authenticateUserByEmail(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        return user.isPresent() && passwordEncoder.matches(password, user.get().getPassword()) ? user : Optional.empty();
    }

    /**
     * Checks if a user can be created by checking if the username and email are unique
     * @param username
     * @param email
     * @return
     */
    public boolean userCanBeCreated(String username, String email) {
        return userRepository.findByUsername(username).isEmpty() && userRepository.findByEmail(email).isEmpty();
    }

    public boolean updateUser(User user) {

        // Validate it has a correct currency
        Currency currency = getCurrencyById(user.getCurrency().getId());

        userRepository.save(user);
        return true; // TODO: check what happens if the user has the email of another user
    }

    public Optional<User> getUserById(UUID id) {
        return userRepository.findById(id);
    }

    /**
     * Checks if a user exists by id
     * @param id
     * @return true if the user exists, false otherwise
     */
    public boolean userExists(UUID id) {
        return userRepository.existsById(id);
    }

    public List<ExpenseCategory> getUserExpenseCategories(UUID userId) {
        List<ExpenseCategory> categories = expenseCategoryService.getCategoriesForUser(userId);
        return categories;
    }

    public void saveExpenseCategories(List<ExpenseCategory> categories) {
        for (ExpenseCategory category : categories) {
            expenseCategoryService.saveCategory(category);
        }
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    public void deleteUser(User user) {
        userRepository.delete(user);
    }

    /**
     * Gets all users from the database
     * @return a list of all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    private Currency getCurrencyById(int currencyId) {
        return currencyRepository.findById(currencyId).
                orElseThrow(() -> new RuntimeException("Currency not found")); // TODO: create a custom exception
    }
}

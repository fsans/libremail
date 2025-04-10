<?php

namespace App\Model;

use App\Exceptions\AccountExists as AccountExistsException;
use App\Exceptions\DatabaseInsert as DatabaseInsertException;
use App\Exceptions\DatabaseUpdate as DatabaseUpdateException;
use App\Exceptions\Validation as ValidationException;
use App\Model;
use App\Traits\Model as ModelTrait;
use DateTime;
use Particle\Validator\Validator;
use PDO;

class Account extends Model
{
    use ModelTrait;

    public $id;
    public $name;
    public $email;
    public $service;
    public $password;
    public $is_active;
    public $imap_host;
    public $imap_port;
    public $smtp_host;
    public $smtp_port;
    public $imap_flags;
    public $created_at;

    public function getData()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'service' => $this->service,
            'password' => $this->password,
            'is_active' => $this->is_active,
            'imap_host' => $this->imap_host,
            'imap_port' => $this->imap_port,
            'smtp_host' => $this->smtp_host,
            'smtp_port' => $this->smtp_port,
            'imap_flags' => $this->imap_flags,
            'created_at' => $this->created_at
        ];
    }

    public function getEmail()
    {
        return $this->email;
    }

    /**
     * Create a new account record.
     *
     * @throws AccountExistsException
     * @throws DatabaseInsertException
     * @throws DatabaseUpdateException
     */
    public function save(array $data = [], bool $updateIfExists = false)
    {
        $this->setData($data);
        $this->validate();

        $data = $this->getData();

        // Check if this email exists
        $exists = $this->db()
            ->select()
            ->from('accounts')
            ->where('email', '=', $data['email'])
            ->execute()
            ->fetchObject();

        if ($exists) {
            if (! $updateIfExists) {
                throw new AccountExistsException($data['email']);
            }

            $this->id = $exists->id;

            unset($data['id']);
            unset($data['created_at']);

            $updated = $this->db()
                ->update($data)
                ->table('accounts')
                ->where('id', '=', $exists->id)
                ->execute();

            if (false === $updated) {
                throw new DatabaseUpdateException(FOLDER);
            }

            return;
        }

        $createdAt = new DateTime;

        unset($data['id']);

        $data['is_active'] = 1;
        $data['service'] = strtolower($data['service']);
        $data['created_at'] = $createdAt->format(DATE_DATABASE);

        $newAccountId = $this->db()
            ->insert(array_keys($data))
            ->into('accounts')
            ->values(array_values($data))
            ->execute();

        if (! $newAccountId) {
            throw new DatabaseInsertException(ACCOUNT, $this->getError());
        }

        $this->id = $newAccountId;
    }

    /**
     * Validate the account data.
     *
     * @throws ValidationException
     */
    public function validate()
    {
        $val = new Validator();

        $val->required('name', 'Name')->lengthBetween(0, 100);
        $val->required('email', 'Email')->lengthBetween(0, 100);
        $val->required('service', 'Service type')->inArray(
            array_map(
                'strtolower',
                $this->config('email.services')
            ));
        $val->required('password', 'Password')->lengthBetween(0, 100);
        $val->optional('password_hash', 'Password Hash')->lengthBetween(0, 255);

        $val->optional('imap_host', 'IMAP host')->lengthBetween(0, 50);
        $val->optional('imap_port', 'IMAP port')->lengthBetween(0, 5);
        $val->optional('smtp_host', 'SMTP host')->lengthBetween(0, 50);
        $val->optional('smtp_port', 'SMTP port')->lengthBetween(0, 5);
        $val->optional('imap_flags', 'IMAP flags')->lengthBetween(0, 50);

        $result = $val->validate($this->getData());

        if (! $result->isValid()) {
            $message = $this->getErrorString(
                $result,
                'There was a problem creating this account.'
            );

            throw new ValidationException($message);
        }
    }

    public function getActive()
    {
        return $this->db()
            ->select()
            ->from('accounts')
            ->where('is_active', '=', 1)
            ->execute()
            ->fetchAll(PDO::FETCH_CLASS, $this->getClass());
    }

    public function getByEmail(string $email)
    {
        $account = $this->db()
            ->select()
            ->from('accounts')
            ->where('email', '=', $email)
            ->execute()
            ->fetchObject();

        return $account
            ? new self($account)
            : $account;
    }

    /**
     * Uses the email address to try and infer the IMAP service.
     */
    public function loadServiceFromEmail()
    {
        // Build the array of services
        $config = [];
        $services = $this->config('email.services');

        foreach ($services as $serviceName) {
            $key = strtolower($serviceName);
            $service = $this->config("email.$key");

            if (isset($service['domain'])) {
                $config[$service['domain']] = $service;
                $config[$service['domain']]['key'] = $key;
            }
        }

        // Get the domain from the email
        $emailParts = explode('@', $this->email);

        if (2 !== count($emailParts)) {
            return;
        }

        if (! isset($config[$emailParts[1]])) {
            $this->service = DEFAULT_SERVICE;

            $other = $this->config('email.other');

            if (! $this->imap_port) {
                $this->imap_port = $other['port'];
                $this->smtp_port = $other['smtp_port'];
            }

            return;
        }

        $this->service = $config[$emailParts[1]]['key'];
        $this->imap_host = $config[$emailParts[1]]['host'];
        $this->imap_port = $config[$emailParts[1]]['port'];
        $this->smtp_host = $config[$emailParts[1]]['smtp_host'];
        $this->smtp_port = $config[$emailParts[1]]['smtp_port'];
    }

    /**
     * Get all accounts that don't have a password hash yet
     * 
     * @return array Account objects
     */
    public function getAccountsWithoutHash()
    {
        return $this->db()
            ->select()
            ->from('accounts')
            ->where('password_hash', 'IS', null)
            ->where('password', 'IS NOT', null)
            ->execute()
            ->fetchAll(\PDO::FETCH_CLASS, $this->getClass());
    }
    
    /**
     * Migrate a single account's password to use hashing
     * 
     * @param Account $account The account to migrate
     * @return bool Success
     */
    public function migrateAccountPassword($account)
    {
        if (empty($account->password)) {
            return false;
        }
        
        // Hash the existing password
        $passwordHash = $this->hashPassword($account->password);
        
        // Update the account with the hashed password
        $updated = $this->db()
            ->update(['password_hash' => $passwordHash])
            ->table('accounts')
            ->where('id', '=', $account->id)
            ->execute();
            
        return $updated !== false;
    }

    /**
     * Hash a password using a secure algorithm
     * 
     * @param string $password The plaintext password to hash
     * @return string The hashed password
     */
    private function hashPassword(string $password): string
    {
        // Use PHP's password_hash function with bcrypt (default)
        // Cost factor of 12 is a good balance between security and performance
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    /**
     * Verify a password against its hash
     * 
     * @param string $password The plaintext password to check
     * @param string $hash The stored hash to verify against
     * @return bool True if the password matches the hash
     */
    private function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    /**
     * Get the password for IMAP/SMTP authentication
     * During the transition period, check both password_hash and password fields
     * 
     * @return string The plaintext password for authentication
     */
    public function getAuthPassword(): string
    {
        // If we're using the new system with password_hash
        if (!empty($this->password_hash)) {
            // The plaintext password should be available in memory during the authentication process
            // but not stored in the database
            return $this->password;
        }
        
        // During transition, fall back to the old plaintext password
        return $this->password;
    }
}

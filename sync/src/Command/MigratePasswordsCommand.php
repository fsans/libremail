<?php

namespace App\Command;

use App\Model\Account as AccountModel;
use League\CLImate\CLImate;
use Monolog\Logger;

/**
 * Command to migrate plaintext passwords to hashed passwords
 */
class MigratePasswordsCommand
{
    private $log;
    private $cli;

    public function __construct(Logger $log, CLImate $cli)
    {
        $this->log = $log;
        $this->cli = $cli;
    }

    /**
     * Execute the password migration
     */
    public function execute()
    {
        $this->cli->info('Starting password migration...');
        
        $accountModel = new AccountModel();
        $accounts = $accountModel->getAccountsWithoutHash();
        
        $count = count($accounts);
        $this->cli->info("Found {$count} accounts to migrate");
        
        if ($count === 0) {
            $this->cli->info('No accounts to migrate. Exiting.');
            return;
        }
        
        $progress = $this->cli->progress()->total($count);
        $migrated = 0;
        
        foreach ($accounts as $i => $account) {
            try {
                $accountModel->migrateAccountPassword($account);
                $migrated++;
                $progress->current($i + 1);
            } catch (\Exception $e) {
                $this->log->error("Failed to migrate account {$account->id}: " . $e->getMessage());
                $this->cli->error("Failed to migrate account {$account->id}");
            }
        }
        
        $this->cli->info("Successfully migrated {$migrated} of {$count} accounts");
    }
}
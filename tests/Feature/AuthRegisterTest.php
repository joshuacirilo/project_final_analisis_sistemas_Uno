<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthRegisterTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);

        $this->tenant = Tenant::factory()->create([
            'id' => '00000000-0000-4000-8000-000000000001',
            'slug' => 'san-marcos-demo',
            'name' => 'Hospital General San Marcos (demo)',
        ]);
    }

    public function test_register_creates_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/v1/auth/register', $this->validPayload(), $this->tenantHeaders());

        $response->assertCreated()
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'expires_in',
                'user' => ['id', 'name', 'email', 'roles', 'tenant'],
            ])
            ->assertJsonPath('token_type', 'bearer')
            ->assertJsonPath('user.email', 'maria@example.com')
            ->assertJsonPath('user.roles.0.name', 'Recepcionista');

        $this->assertDatabaseHas('users', [
            'tenant_id' => $this->tenant->id,
            'email' => 'maria@example.com',
        ]);
    }

    public function test_register_rejects_duplicate_email_in_same_tenant(): void
    {
        User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'email' => 'maria@example.com',
        ]);

        $response = $this->postJson('/api/v1/auth/register', $this->validPayload(), $this->tenantHeaders());

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email'])
            ->assertJsonFragment([
                'email' => ['El correo electrónico ya está registrado en este hospital.'],
            ]);
    }

    public function test_register_allows_same_email_in_different_tenant(): void
    {
        $otherTenant = Tenant::factory()->create();

        User::factory()->create([
            'tenant_id' => $otherTenant->id,
            'email' => 'maria@example.com',
        ]);

        $response = $this->postJson('/api/v1/auth/register', $this->validPayload(), $this->tenantHeaders());

        $response->assertCreated()
            ->assertJsonPath('user.email', 'maria@example.com')
            ->assertJsonPath('user.tenant_id', $this->tenant->id);
    }

    public function test_register_rejects_weak_password(): void
    {
        $payload = $this->validPayload([
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response = $this->postJson('/api/v1/auth/register', $payload, $this->tenantHeaders());

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }

    public function test_register_rejects_password_confirmation_mismatch(): void
    {
        $payload = $this->validPayload([
            'password_confirmation' => 'OtherPass1!',
        ]);

        $response = $this->postJson('/api/v1/auth/register', $payload, $this->tenantHeaders());

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['password'])
            ->assertJsonFragment([
                'password' => ['Las contraseñas no coinciden.'],
            ]);
    }

    public function test_register_rejects_invalid_name(): void
    {
        $payload = $this->validPayload(['name' => 'A']);

        $response = $this->postJson('/api/v1/auth/register', $payload, $this->tenantHeaders());

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_register_requires_tenant_header(): void
    {
        $response = $this->postJson('/api/v1/auth/register', $this->validPayload());

        $response->assertBadRequest()
            ->assertJson([
                'message' => 'La cabecera X-Tenant-ID es obligatoria.',
            ]);
    }

    public function test_register_normalizes_email_to_lowercase(): void
    {
        $payload = $this->validPayload(['email' => '  Maria@Example.COM  ']);

        $response = $this->postJson('/api/v1/auth/register', $payload, $this->tenantHeaders());

        $response->assertCreated()
            ->assertJsonPath('user.email', 'maria@example.com');
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'María López',
            'email' => 'maria@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ], $overrides);
    }

    /**
     * @return array<string, string>
     */
    private function tenantHeaders(): array
    {
        return [
            'X-Tenant-ID' => $this->tenant->id,
        ];
    }
}

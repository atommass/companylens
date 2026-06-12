<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->string('name'),
            'email' => $request->string('email'),
            'password' => Hash::make($request->string('password')),
        ]);

        if ($request->hasSession()) {
            Auth::login($user);
            $request->session()->regenerate();

            return response()->json([
                'user' => $user,
            ]);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()->where('email', $request->string('email'))->first();

        if (! $user || ! Hash::check($request->string('password'), $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        if ($request->hasSession()) {
            Auth::login($user);
            $request->session()->regenerate();

            return response()->json([
                'user' => $user,
            ]);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        if ($request->hasSession()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out']);
    }

    /**
     * @throws ValidationException
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (! $user || ! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
        ])->save();

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function destroyProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (! $user || ! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        if ($request->hasSession()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'Profile deleted successfully.',
        ]);
    }

    public function socialAuth(Request $request, string $provider): JsonResponse
    {
        $token = $request->string('token');

        if (!$token) {
            return response()->json(['message' => 'Token required'], 422);
        }

        try {
            $socialUser = match($provider) {
                'google' => $this->verifySocialToken($provider, $token),
                'facebook' => $this->verifySocialToken($provider, $token),
                default => throw new \Exception('Invalid provider'),
            };

            $user = User::query()
                ->where('provider', $provider)
                ->where('provider_id', $socialUser['id'])
                ->first();

            if (!$user) {
                $user = User::create([
                    'name' => $socialUser['name'],
                    'email' => $socialUser['email'],
                    'provider' => $provider,
                    'provider_id' => $socialUser['id'],
                    'password' => Hash::make('social-' . uniqid()),
                ]);
            }

            $authToken = $user->createToken('api')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $authToken,
                'token_type' => 'Bearer',
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Authentication failed: ' . $e->getMessage()], 422);
        }
    }

    private function verifySocialToken(string $provider, string $token): array
    {
        if ($provider === 'google') {
            $response = \Illuminate\Support\Facades\Http::get('https://www.googleapis.com/oauth2/v1/userinfo', [
                'access_token' => $token,
            ]);

            if (!$response->successful()) {
                throw new \Exception('Invalid Google token');
            }

            $data = $response->json();

            return [
                'id' => $data['id'],
                'name' => $data['name'] ?? '',
                'email' => $data['email'] ?? '',
            ];
        }

        if ($provider === 'facebook') {
            $response = \Illuminate\Support\Facades\Http::get('https://graph.facebook.com/me', [
                'access_token' => $token,
                'fields' => 'id,name,email',
            ]);

            if (!$response->successful()) {
                throw new \Exception('Invalid Facebook token');
            }

            $data = $response->json();

            return [
                'id' => $data['id'],
                'name' => $data['name'] ?? '',
                'email' => $data['email'] ?? '',
            ];
        }

        throw new \Exception('Unsupported provider');
    }
}
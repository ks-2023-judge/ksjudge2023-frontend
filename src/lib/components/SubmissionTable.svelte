<script lang="ts">
	export let handleModal: (data: IModal) => void;

	import type { IFetchResponse, IModal, ISubmit } from '$lib/types';
	import { customFetch } from '$lib/customFetch';
	import { getTimeDifferenceString } from '$lib/utils';
	import { onDestroy } from 'svelte';

	let submitList: ISubmit[];

	const refreshSubmissions = async () => {
		try {
			const response = await customFetch<IFetchResponse<ISubmit[]>>({
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					query: `{ submit { id type problemNo lang state extra result submit_at } }`
				})
			});

			if (response.errors) {
				throw new Error(response.errors[0].message);
			}

			submitList = response.data.submit
				.filter((submit: ISubmit) => submit.type === '1')
				.sort((a: ISubmit, b: ISubmit) => b.id - a.id);
		} catch (e) {
			console.log(e);
			return e;
		}
	};

	refreshSubmissions();
	const refreshIntervalId = setInterval(refreshSubmissions, 5000);

	onDestroy(() => clearInterval(refreshIntervalId));
</script>

<div class="w-7/12">
	<h3 class="text-center text-lg bg-blue-300 font-bold border-y-2 border-black mb-4">제출</h3>
	<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
		<table class="w-full text-lg text-center">
			<thead class="text-base text-gray-700 uppercase bg-gray-50">
				<tr>
					<th scope="col" class="px-6 py-3">시간</th>
					<th scope="col" class="px-6 py-3">문제</th>
					<th scope="col" class="px-6 py-3">언어</th>
					<th scope="col" class="px-6 py-3">결과</th>
				</tr>
			</thead>
			<tbody>
				{#if submitList}
					{#each submitList as submit}
						<tr
							class="bg-white border-b"
							on:click={() =>
								handleModal({
									title: submit.id.toString(),
									body: submit.extra,
									etc: submit
								})}
						>
							<th class="whitespace-nowrap font-medium">
								{getTimeDifferenceString(new Date(parseInt(submit.submit_at)))}
							</th>
							<td class="p-2 whitespace-nowrap font-medium">
								{submit.problemNo}
							</td>
							<td class="p-2">
								{submit.lang}
							</td>
							<td class="p-2">
								{#if submit.state == '0'}
									<div class="text-gray-500">채점 대기</div>
								{:else if submit.state == '1'}
									<div>채점 중...</div>
								{:else if submit.state == '2'}
									{#if submit.result == '0'}
										<div class="text-green-400">정답</div>
									{:else if submit.result == '1'}
										<div class="text-red-orange-500">{submit.extra}</div>
									{/if}
								{/if}
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
